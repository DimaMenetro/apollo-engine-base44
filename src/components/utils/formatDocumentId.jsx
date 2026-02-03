/**
 * Formats Document ID for display (UI and export)
 * Converts hex IDs to decimal while preserving format: DSP-{digits}-CP-003-APL
 */
export function formatDocumentId(rawId) {
  if (!rawId) return '';
  
  // Already in decimal format
  if (/^DSP-\d+-CP-003-APL$/.test(rawId)) {
    return rawId;
  }
  
  // Convert hex to decimal
  const hexMatch = rawId.match(/^DSP-([0-9a-fA-F]+)-CP-003-APL$/);
  if (hexMatch) {
    const decimal = parseInt(hexMatch[1], 16);
    if (!isNaN(decimal)) {
      return `DSP-${decimal}-CP-003-APL`;
    }
  }
  
  // Fallback: return as-is
  return rawId;
}