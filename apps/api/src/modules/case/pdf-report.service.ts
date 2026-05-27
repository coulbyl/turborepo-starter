import { Injectable } from '@nestjs/common';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import PDFDocument from 'pdfkit';

type FormData = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  country?: string;
  idType?: string;
  idNumber?: string | null;
};

type VerificationResult = {
  ResultCode?: string;
  ResultText?: string;
  SmileJobID?: string;
  ExpirationDate?: string;
  ExtractedData?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    idNumber?: string;
    country?: string;
    idType?: string;
  };
  AML?: {
    match?: boolean;
    matchedLists?: string[];
    summary?: string;
  };
  Duplicate?: {
    found?: boolean;
    matchedCaseId?: string;
  };
  Document?: {
    reason?: string;
    expiryStatus?: string;
  };
  Flags?: string[];
  FailureReasons?: string[];
  Warnings?: string[];
  Provider?: {
    name?: string;
    mode?: string;
    scenario?: string;
    authorityVerified?: boolean;
    jobType?: number;
  };
};

type VerificationRawResult = {
  authorityVerified?: boolean;
  jobType?: number;
  result?: VerificationResult;
};

type ReportCase = {
  reference: string;
  createdAt: Date | string;
  formData: unknown;
  verification: {
    status: string;
    smileJobId?: string;
    product?: string;
    livenessScore: number | null;
    documentValid: boolean | null;
    faceMatch: boolean | null;
    amlMatch: boolean | null;
    duplicateFound: boolean | null;
    rawResult?: unknown;
    updatedAt?: Date | string;
  } | null;
  workspace: { name: string; logoUrl: string | null };
};

const BLUE = '#2563eb';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#e5e7eb';
const RED = '#ef4444';
const GREEN = '#10b981';
const AMBER = '#d97706';
const TEXT = '#111827';

const PRODUCT_LABEL: Record<string, string> = {
  DOC_VERIFY: 'Vérification de document',
  DOC_VERIFY_AML: 'Vérification de document + sanctions',
  SMILE_SECURE: 'Recherche de doublon biométrique',
  BASIC_KYC: "Vérification d'identité simple",
};

const SCENARIO_LABEL: Record<string, string> = {
  'clean-pass': 'Dossier sans anomalie',
  'review-authority-unavailable': 'Contrôle manuel requis',
  'face-mismatch': 'Visage non concordant',
  'expired-document': 'Document expiré',
  'aml-hit': 'Alerte sanctions',
  'duplicate-hit': 'Suspicion de doublon',
  'data-mismatch': 'Écart entre saisie et document',
};

const FLAG_LABEL: Record<string, string> = {
  WARNINGS: 'Points à vérifier',
  AML_HIT: 'Alerte sanctions',
  REQUIRES_COMPLIANCE_REVIEW: 'Revue conformité requise',
  POSSIBLE_DUPLICATE: 'Suspicion de doublon',
  DECLARED_DATA_MISMATCH: 'Écart entre saisie et document',
  AUTHORITY_CHECK_DELAYED: 'Contrôle source officielle en attente',
  FACE_MISMATCH: 'Visage non concordant',
  DOCUMENT_EXPIRED: 'Document expiré',
};

type FieldOptions = {
  valueColor?: string;
  labelWidth?: number;
};

function bool(
  value: boolean | null,
  trueLabel: string,
  falseLabel: string,
): string {
  if (value === null) return '—';
  return value ? trueLabel : falseLabel;
}

function toReadableLabel(
  value: string | undefined,
  map: Record<string, string>,
): string {
  if (!value) return '—';
  return map[value] ?? value;
}

function formatDateValue(value: string | Date | undefined | null): string {
  if (!value) return '—';
  const parsed = typeof value === 'string' ? parseISO(value) : value;

  if (!isValid(parsed)) return typeof value === 'string' ? value : '—';
  return format(parsed, 'd MMMM yyyy', { locale: fr });
}

function formatDateTimeValue(value: string | Date | undefined | null): string {
  if (!value) return '—';
  const parsed = typeof value === 'string' ? parseISO(value) : value;

  if (!isValid(parsed)) return typeof value === 'string' ? value : '—';
  return format(parsed, 'd MMMM yyyy HH:mm', { locale: fr });
}

function formatScore(score: number | null | undefined): string {
  if (typeof score !== 'number') return '—';
  return `${Math.round(score * 100)}%`;
}

function compareValues(
  declared: string | undefined | null,
  verified: string | undefined | null,
): string {
  if (!declared || !verified) return 'Incomplet';
  return declared.trim().toLowerCase() === verified.trim().toLowerCase()
    ? 'Concorde'
    : 'Écart';
}

function getRawVerificationResult(
  rawResult: unknown,
): VerificationRawResult | null {
  if (!rawResult || typeof rawResult !== 'object' || Array.isArray(rawResult)) {
    return null;
  }
  return rawResult;
}

@Injectable()
export class PdfReportService {
  async generate(c: ReportCase): Promise<Buffer> {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const formData = c.formData as FormData | null;
    const verification = c.verification;
    const rawVerification = getRawVerificationResult(verification?.rawResult);
    const result = rawVerification?.result;
    const extracted = result?.ExtractedData;
    const flags = result?.Flags ?? [];
    const warnings = result?.Warnings ?? [];
    const failureReasons = result?.FailureReasons ?? [];
    const statusColor =
      verification?.status === 'APPROVED'
        ? GREEN
        : verification?.status === 'REJECTED'
          ? RED
          : AMBER;
    const statusLabel =
      verification?.status === 'APPROVED'
        ? 'Contrôle concluant'
        : verification?.status === 'REJECTED'
          ? 'Contrôle rejeté'
          : verification?.status === 'PENDING'
            ? 'En cours ou à revoir'
            : '—';

    doc.fontSize(20).fillColor(BLUE).text('Identis', 50, 50);
    doc
      .fontSize(9)
      .fillColor(GRAY)
      .text("Rapport de vérification d'identité", 50, 76);

    doc.fontSize(9).fillColor(GRAY).text(c.workspace.name, { align: 'right' });
    doc
      .fontSize(8)
      .fillColor(GRAY)
      .text(`Généré le ${formatDateValue(new Date())}`, {
        align: 'right',
      });

    doc
      .moveTo(50, 100)
      .lineTo(545, 100)
      .strokeColor(LIGHT_GRAY)
      .lineWidth(1)
      .stroke();

    doc.y = 115;
    doc.fontSize(16).fillColor(TEXT).text(c.reference, 50);
    doc
      .fontSize(10)
      .fillColor(statusColor)
      .text(statusLabel, 50, doc.y + 4);
    doc
      .fontSize(8)
      .fillColor(GRAY)
      .text(`Créé le ${formatDateTimeValue(c.createdAt)}`);

    doc.moveDown(1.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor(LIGHT_GRAY)
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(1);

    this.sectionTitle(doc, 'Résumé du contrôle');
    this.field(doc, 'Statut', statusLabel, { valueColor: statusColor });
    this.field(
      doc,
      'Produit',
      PRODUCT_LABEL[verification?.product ?? ''] ??
        verification?.product ??
        '—',
    );
    this.field(
      doc,
      'Référence technique',
      verification?.smileJobId ?? result?.SmileJobID ?? '—',
    );
    this.field(
      doc,
      'Type de contrôle',
      this.getJobTypeLabel(
        result?.Provider?.jobType ?? rawVerification?.jobType,
      ),
    );
    this.field(
      doc,
      'Source officielle',
      (result?.Provider?.authorityVerified ??
        rawVerification?.authorityVerified)
        ? 'Oui'
        : 'Non',
    );
    this.field(
      doc,
      'Cas simulé',
      toReadableLabel(result?.Provider?.scenario, SCENARIO_LABEL),
    );
    this.field(doc, 'Détail du contrôle', result?.ResultText ?? '—');

    doc.moveDown(0.8);
    this.sectionTitle(doc, 'Contrôles détaillés');
    this.field(
      doc,
      'Présence réelle',
      formatScore(verification?.livenessScore ?? null),
    );
    this.field(
      doc,
      'Correspondance du visage',
      bool(verification?.faceMatch ?? null, 'Conforme', 'Non conforme'),
    );
    this.field(
      doc,
      'Validité du document',
      bool(verification?.documentValid ?? null, 'Valide', 'Non valide'),
    );
    this.field(doc, 'Raison document', result?.Document?.reason ?? '—');
    this.field(
      doc,
      'Contrôle sanctions',
      verification?.amlMatch
        ? 'Correspondance trouvée'
        : (result?.AML?.summary ?? 'Aucune alerte'),
    );
    this.field(
      doc,
      'Doublon biométrique',
      verification?.duplicateFound
        ? result?.Duplicate?.matchedCaseId
          ? `Oui, proche de ${result.Duplicate.matchedCaseId}`
          : 'Oui'
        : 'Aucun doublon détecté',
    );

    doc.moveDown(0.8);
    this.sectionTitle(doc, 'Comparaison des informations');

    if (formData) {
      this.field(
        doc,
        'Prénom',
        `${formData.firstName ?? '—'} / ${extracted?.firstName ?? '—'} (${compareValues(formData.firstName, extracted?.firstName)})`,
        { labelWidth: 120 },
      );
      this.field(
        doc,
        'Nom',
        `${formData.lastName ?? '—'} / ${extracted?.lastName ?? '—'} (${compareValues(formData.lastName, extracted?.lastName)})`,
        { labelWidth: 120 },
      );
      this.field(
        doc,
        'Date de naissance',
        `${formatDateValue(formData.dateOfBirth)} / ${formatDateValue(extracted?.dateOfBirth)} (${compareValues(formData.dateOfBirth, extracted?.dateOfBirth)})`,
        { labelWidth: 120 },
      );
      this.field(
        doc,
        'N° document',
        `${formData.idNumber ?? '—'} / ${extracted?.idNumber ?? '—'} (${compareValues(formData.idNumber, extracted?.idNumber)})`,
        { labelWidth: 120 },
      );
      this.field(
        doc,
        'Pays',
        `${formData.country ?? '—'} / ${extracted?.country ?? '—'} (${compareValues(formData.country, extracted?.country)})`,
        { labelWidth: 120 },
      );
      this.field(
        doc,
        'Type document',
        `${formData.idType ?? '—'} / ${extracted?.idType ?? '—'} (${compareValues(formData.idType, extracted?.idType)})`,
        { labelWidth: 120 },
      );
    } else {
      doc.fontSize(9).fillColor(GRAY).text('Données déclarées indisponibles');
      doc.moveDown(0.5);
    }

    doc.moveDown(0.8);
    this.sectionTitle(doc, 'Points de vigilance');
    const riskItems = [
      ...flags.map((flag) => toReadableLabel(flag, FLAG_LABEL)),
      ...warnings,
      ...failureReasons,
    ];

    if (riskItems.length > 0) {
      for (const item of riskItems) {
        doc.fontSize(9).fillColor(TEXT).text(`• ${item}`);
        doc.moveDown(0.2);
      }
    } else {
      doc.fontSize(9).fillColor(GRAY).text('Aucun point de vigilance signalé');
      doc.moveDown(0.5);
    }

    if (result?.AML?.matchedLists?.length) {
      this.field(doc, 'Listes sanctions', result.AML.matchedLists.join(', '));
    }

    if (result?.Document?.expiryStatus) {
      this.field(
        doc,
        'État du document',
        result.Document.expiryStatus === 'EXPIRED'
          ? 'Expiré'
          : `Valide jusqu’au ${formatDateValue(result.ExpirationDate)}`,
      );
    }

    doc
      .fontSize(7)
      .fillColor('#9ca3af')
      .text(
        "Ce rapport est généré automatiquement par Identis et doit être interprété avec le jugement de l'opérateur.",
        50,
        760,
        { align: 'center', width: 495 },
      );

    doc.end();
    return done;
  }

  private getJobTypeLabel(jobType: number | undefined): string {
    if (jobType === 11) return 'Document + source officielle';
    if (jobType === 6) return 'Vérification de document';
    if (jobType === 5) return 'Vérification textuelle';
    return '—';
  }

  private sectionTitle(doc: InstanceType<typeof PDFDocument>, title: string) {
    doc.fontSize(10).fillColor(BLUE).font('Helvetica-Bold').text(title);
    doc.font('Helvetica').moveDown(0.5);
  }

  // eslint-disable-next-line max-params
  private field(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    value: string,
    options?: FieldOptions,
  ) {
    const valueColor = options?.valueColor ?? TEXT;
    const labelWidth = options?.labelWidth ?? 150;
    doc
      .fontSize(8)
      .fillColor(GRAY)
      .text(label, 50, doc.y, { continued: true, width: labelWidth });
    doc.fillColor(valueColor).text(value);
    doc.moveDown(0.3);
  }
}
