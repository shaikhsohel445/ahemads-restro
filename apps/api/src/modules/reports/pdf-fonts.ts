import bold from '../../../assets/fonts/IBMPlexSansArabic-Bold.ttf';
import regular from '../../../assets/fonts/IBMPlexSansArabic-Regular.ttf';

// IBM Plex Sans Arabic carries both Latin and Arabic glyphs, so one embedded
// font renders English, Arabic and mixed report cells. pdfkit's built-in
// Helvetica (the self-hosted build) cannot encode Arabic at all.
export const PDF_FONTS = { regular, bold };
