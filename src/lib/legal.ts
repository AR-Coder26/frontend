/** Shared source-of-truth for the legal/policy pages (Terms, Privacy, Refund) and the
 * Footer's legal links. Centralized here so the store name and effective date only ever
 * need updating in one place.
 */
export const STORE_LEGAL_NAME = 'Brandox';

/** Brandox is run as an individually owned business (sole proprietorship) based in
 *  Pakistan, selling only within Pakistan — update this if the business is later
 *  incorporated or starts shipping internationally, since several clauses below
 *  (governing law, GDPR/CCPA framing) are written around this. */
export const STORE_JURISDICTION_LINE =
  'Brandox is operated as an individually owned business (sole proprietorship) based in Pakistan.';

export const LEGAL_EFFECTIVE_DATE = 'September 14, 2026';

/** Days after delivery a customer has to report a defective or incorrect item. */
export const RETURN_REPORT_WINDOW_DAYS = 3;
