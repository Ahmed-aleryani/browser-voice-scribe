export function localRuleBasedFormat(rawText) {
    const normalized = rawText
        .replace(/\s+new line\s+/gi, '\n')
        .replace(/\s+comma\s+/gi, ', ')
        .replace(/\s+period\s+/gi, '. ')
        .replace(/\s+question mark\s+/gi, '? ')
        .replace(/\s+exclamation mark\s+/gi, '! ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    if (!normalized) return '';

    const sentences = normalized
        .split(/([.!?]\s+)/)
        .reduce((acc, part, idx, arr) => {
            if (idx % 2 === 0) {
                const punct = arr[idx + 1] || '';
                if (part) acc.push(`${part}${punct}`);
            }
            return acc;
        }, []);

    const rebuilt = sentences.length ? sentences.join('').trim() : normalized;
    return rebuilt.charAt(0).toUpperCase() + rebuilt.slice(1);
}

function tokenizeForComparison(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

export function isFormattingSafe(rawText, formattedText) {
    const rawTokens = tokenizeForComparison(rawText);
    const fmtTokens = tokenizeForComparison(formattedText);

    if (!formattedText || !formattedText.trim()) return false;
    if (!rawTokens.length || !fmtTokens.length) return true;

    const ratio = fmtTokens.length / rawTokens.length;
    if (ratio < 0.6 || ratio > 1.8) return false;

    const rawSet = new Set(rawTokens);
    let shared = 0;
    for (const token of fmtTokens) {
        if (rawSet.has(token)) shared += 1;
    }

    const overlap = shared / Math.max(rawTokens.length, fmtTokens.length);
    return overlap >= 0.55;
}

export async function formatWithLLM(engine, rawText) {
    const prompt = `You are a dictation assistant. Reformat the following text.
If the user said "new line", insert a line break.
Fix punctuation and capitalization.
Do not change meaning. Do not add or remove factual words. Only punctuation, casing, and spacing fixes are allowed.
Output ONLY the corrected text.

Text: "${rawText}"`;

    const response = await engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
    });

    return response?.choices?.[0]?.message?.content?.trim() || rawText;
}

export async function formatText(rawText, mode, engine) {
    if (mode === 'web-llm' && engine) {
        const formatted = await formatWithLLM(engine, rawText);
        return isFormattingSafe(rawText, formatted) ? formatted : rawText;
    }

    const fallback = localRuleBasedFormat(rawText);
    return isFormattingSafe(rawText, fallback) ? fallback : rawText;
}