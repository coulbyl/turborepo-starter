import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

type FormData = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  country?: string;
  idType?: string;
  idNumber?: string | null;
};

type ReportCase = {
  reference: string;
  createdAt: Date | string;
  formData: unknown;
  verification: {
    status: string;
    livenessScore: number | null;
    documentValid: boolean | null;
    faceMatch: boolean | null;
    amlMatch: boolean | null;
    duplicateFound: boolean | null;
  } | null;
  workspace: { name: string; logoUrl: string | null };
};

const BLUE = '#2563eb';
const GRAY = '#6b7280';
const RED = '#ef4444';
const GREEN = '#10b981';

function bool(val: boolean | null, trueLabel: string, falseLabel: string): string {
  if (val === null) return '—';
  return val ? trueLabel : falseLabel;
}

@Injectable()
export class PdfReportService {
  generate(c: ReportCase): Buffer {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(20).fillColor(BLUE).text('Identis', 50, 50);
    doc.fontSize(9).fillColor(GRAY).text('Rapport de vérification d\'identité', 50, 76);

    doc.fontSize(9).fillColor(GRAY).text(c.workspace.name, { align: 'right' });
    doc.fontSize(8).fillColor(GRAY).text(
      `Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      { align: 'right' },
    );

    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ── Reference + status ────────────────────────────────────────────────────
    doc.y = 115;
    doc.fontSize(16).fillColor('#111827').text(c.reference, 50);

    const statusColor = c.verification?.status === 'APPROVED' ? GREEN
      : c.verification?.status === 'REJECTED' ? RED : GRAY;
    const statusLabel = c.verification?.status === 'APPROVED' ? 'Approuvé'
      : c.verification?.status === 'REJECTED' ? 'Rejeté'
      : c.verification?.status === 'PENDING' ? 'En attente'
      : '—';

    doc.fontSize(10).fillColor(statusColor).text(statusLabel, 50, doc.y + 4);
    doc.fontSize(8).fillColor(GRAY).text(
      `Créé le ${new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    );

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    doc.moveDown(1);

    // ── Subject identity ──────────────────────────────────────────────────────
    this.sectionTitle(doc, 'Identité du sujet');

    const fd = c.formData as FormData | null;
    if (fd) {
      this.field(doc, 'Prénom', fd.firstName ?? '—');
      this.field(doc, 'Nom', fd.lastName ?? '—');
      this.field(doc, 'Date de naissance', fd.dateOfBirth ?? '—');
      this.field(doc, 'Pays', fd.country ?? '—');
      this.field(doc, 'Type de document', fd.idType ?? '—');
      this.field(doc, 'N° document', fd.idNumber ?? '—');
    } else {
      doc.fontSize(9).fillColor(GRAY).text('Données non disponibles');
    }

    doc.moveDown(1);

    // ── Verification result ───────────────────────────────────────────────────
    this.sectionTitle(doc, 'Résultat biométrique');

    if (c.verification) {
      const v = c.verification;
      this.field(doc, 'Statut', statusLabel, statusColor);
      if (v.livenessScore !== null) {
        this.field(doc, 'Score liveness', `${Math.round(v.livenessScore * 100)}%`);
      }
      this.field(doc, 'Document valide', bool(v.documentValid, 'Oui', 'Non'));
      this.field(doc, 'Face match', bool(v.faceMatch, 'Passé', 'Échoué'));
      this.field(doc, 'AML (sanctions)', bool(v.amlMatch, 'Correspondance trouvée', 'Aucune correspondance'));
      this.field(doc, 'Doublon biométrique', bool(v.duplicateFound, 'Doublon détecté', 'Aucun doublon'));
    } else {
      doc.fontSize(9).fillColor(GRAY).text('Vérification non disponible');
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.fontSize(7).fillColor('#9ca3af').text(
      'Ce rapport est généré automatiquement par Identis et ne constitue pas un document légal.',
      50,
      760,
      { align: 'center', width: 495 },
    );

    doc.end();

    // Collect all chunks synchronously (pdfkit emits synchronously when no streams)
    return Buffer.concat(chunks);
  }

  private sectionTitle(doc: InstanceType<typeof PDFDocument>, title: string) {
    doc.fontSize(10).fillColor(BLUE).font('Helvetica-Bold').text(title);
    doc.font('Helvetica').moveDown(0.5);
  }

  private field(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    value: string,
    valueColor = '#111827',
  ) {
    doc.fontSize(8).fillColor(GRAY).text(label, 50, doc.y, { continued: true, width: 140 });
    doc.fillColor(valueColor).text(value);
    doc.moveDown(0.3);
  }
}
