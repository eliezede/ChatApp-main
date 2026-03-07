export const renderTemplate = (templateBody: string, data: Record<string, string | number>): string => {
    if (!templateBody) return '';

    let rendered = templateBody;

    // Replace all occurrences of {{key}} with the corresponding value from data object
    for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        rendered = rendered.replace(placeholder, String(value));
    }

    return rendered;
};
