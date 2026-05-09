export const FILTER_MAX_PRICE_VALUE = 100000000;
const MAX_RANGE_GROUPS = 5;

const stripAccents = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const normalizeText = (value) => stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const isPureNumericString = (value) => typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value.trim());

export const toNumericValue = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!isPureNumericString(value)) return null;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const dedupeFilterValues = (values = []) => Array.from(new Set(
    values.map((value) => String(value).trim()).filter(Boolean)
));

export const sortFilterValues = (values = []) => dedupeFilterValues(values).sort((left, right) => {
    const leftNumeric = toNumericValue(left);
    const rightNumeric = toNumericValue(right);

    if (leftNumeric !== null && rightNumeric !== null) {
        return leftNumeric - rightNumeric;
    }

    if (leftNumeric !== null) return -1;
    if (rightNumeric !== null) return 1;

    return String(left).localeCompare(String(right), 'vi-VN', {
        numeric: true,
        sensitivity: 'base',
    });
});

const formatInteger = (value) => new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
}).format(Math.round(value));

const formatDecimal = (value) => {
    const rounded = Number.parseFloat(Number(value).toFixed(1));
    return Number.isInteger(rounded) ? String(Math.trunc(rounded)) : String(rounded);
};

const formatCapacityValue = (value, unit = '') => {
    const normalizedUnit = normalizeText(unit);

    if (normalizedUnit === 'tb') {
        return `${formatInteger(value)} TB`;
    }

    if (normalizedUnit === 'gb' || normalizedUnit === 'g') {
        if (value < 1) {
            return `${formatInteger(value * 1024)} MB`;
        }

        if (value >= 1024) {
            return `${formatInteger(value / 1024)} TB`;
        }

        return `${formatInteger(value)} GB`;
    }

    return formatInteger(value);
};

const buildRangeLabel = (startValue, endValue, formatter) => {
    if (startValue === endValue) return formatter(startValue);
    return `${formatter(startValue)} - ${formatter(endValue)}`;
};

const chunkBalanced = (items, maxGroups = MAX_RANGE_GROUPS) => {
    if (items.length <= 1) return [items];

    const groupCount = Math.min(maxGroups, Math.max(1, Math.ceil(items.length / 2)));
    const baseSize = Math.floor(items.length / groupCount);
    const remainder = items.length % groupCount;

    const groups = [];
    let cursor = 0;

    for (let index = 0; index < groupCount; index += 1) {
        const size = baseSize + (index < remainder ? 1 : 0);
        const chunk = items.slice(cursor, cursor + size);
        if (chunk.length > 0) groups.push(chunk);
        cursor += size;
    }

    return groups;
};

const getAttributeKind = (attrMeta = {}) => {
    const haystack = `${normalizeText(attrMeta.code)} ${normalizeText(attrMeta.attributeName)} ${normalizeText(attrMeta.unit)}`;

    if (haystack.includes('refresh') || haystack.includes('hz')) return 'screen_refresh';
    if (haystack.includes('ram')) return 'ram';
    if (haystack.includes('ssd')) return 'ssd';
    if (haystack.includes('rom')) return 'rom';
    if (haystack.includes('storage')) return 'storage';
    if (haystack.includes('screen') || haystack.includes('display') || haystack.includes('inch') || haystack.includes('manhinh') || haystack.includes('kichthuoc')) return 'screen';
    if (haystack.includes('weight') || haystack.includes('trongluong')) return 'weight';
    if (haystack.includes('battery') || haystack.includes('dungluongpin') || haystack.includes('pin')) return 'battery';
    if (haystack.includes('dpi')) return 'dpi';
    return 'generic';
};

const buildBucketOptions = (entries, bucketDefs, getComparableValue = (entry) => entry.numeric) => {
    const usedRawValues = new Set();

    return bucketDefs.flatMap((bucket) => {
        const matched = entries.filter((entry) => !usedRawValues.has(entry.rawValue) && bucket.match(getComparableValue(entry)));
        if (matched.length === 0) return [];

        matched.forEach((entry) => usedRawValues.add(entry.rawValue));

        return [{
            key: bucket.key,
            label: bucket.label,
            values: matched.map((entry) => entry.rawValue),
        }];
    });
};

const buildBalancedRangeOptions = (entries, labelFormatter) => chunkBalanced(entries, MAX_RANGE_GROUPS).map((chunk, index) => ({
    key: `range-${index}-${chunk[0].rawValue}-${chunk[chunk.length - 1].rawValue}`,
    label: buildRangeLabel(chunk[0].numeric, chunk[chunk.length - 1].numeric, labelFormatter),
    values: chunk.map((entry) => entry.rawValue),
}));

const buildGenericNumericOptions = (entries, attrMeta) => {
    if (entries.length <= MAX_RANGE_GROUPS) {
        return entries.map((entry, index) => ({
            key: `value-${index}-${entry.rawValue}`,
            label: formatCapacityValue(entry.numeric, attrMeta?.unit),
            values: [entry.rawValue],
        }));
    }

    return buildBalancedRangeOptions(entries, (value) => formatCapacityValue(value, attrMeta?.unit));
};

// New: create bucket defs from threshold list. thresholds: array of numbers ascending.
const createThresholdBucketDefs = (thresholds = [], keyPrefix = 'b', formatter = formatInteger) => {
    const defs = [];
    if (!Array.isArray(thresholds) || thresholds.length === 0) return defs;

    // first "< threshold[0]"
    defs.push({
        key: `${keyPrefix}-lt-${thresholds[0]}`,
        label: `< ${formatter(thresholds[0])}`,
        match: (v) => v < thresholds[0],
    });

    for (let i = 0; i < thresholds.length - 1; i += 1) {
        const a = thresholds[i];
        const b = thresholds[i + 1];
        defs.push({
            key: `${keyPrefix}-${a}-${b}`,
            label: `${formatter(a)} - ${formatter(b)}`,
            match: (v) => v >= a && v < b,
        });
    }

    // last ">= last"
    const last = thresholds[thresholds.length - 1];
    defs.push({
        key: `${keyPrefix}-gte-${last}`,
        label: `≥ ${formatter(last)}`,
        match: (v) => v >= last,
    });

    return defs;
};

const buildRamOptions = (entries, attrMeta) => {
    // thresholds in GB
    const thresholds = [4, 8, 16, 32, 64, 128];
    // ensure entries are compared in GB
    const getComparable = (entry) => convertToBaseGB(entry.numeric, attrMeta?.unit);
    const bucketDefs = createThresholdBucketDefs(thresholds, 'ram', (v) => `${formatInteger(v)} GB`);
    return buildBucketOptions(entries, bucketDefs, getComparable);
};

const buildSsdOptions = (entries, attrMeta) => {
    // thresholds in GB: 128,256,512,1024(1TB),2048(2TB),4096(4TB)
    const thresholds = [128, 256, 512, 1024, 2048, 4096];
    const getComparable = (entry) => convertToBaseGB(entry.numeric, attrMeta?.unit);
    const bucketDefs = createThresholdBucketDefs(thresholds, 'storage', (v) => formatCapacityValue(v, 'GB'));
    return buildBucketOptions(entries, bucketDefs, getComparable);
};

const buildScreenOptions = (entries, attrMeta) => {
    // thresholds as requested: 1,3,5,7,9,11,13,15,17 (inches)
    const thresholds = [1, 3, 5, 7, 9, 11, 13, 15, 17];
    const bucketDefs = createThresholdBucketDefs(thresholds, 'screen', (v) => `${formatDecimal(v)}"`);
    const getComparable = (entry) => entry.numeric; // assume inches already
    const options = buildBucketOptions(entries, bucketDefs, getComparable);
    if (options.length > 0) return options;
    return buildGenericNumericOptions(entries, attrMeta);
};

const buildScreenRefreshOptions = (entries) => {
    const thresholds = [60, 120, 180, 240];
    const bucketDefs = createThresholdBucketDefs(thresholds, 'screen-refresh', (v) => `${formatInteger(v)} Hz`);
    return buildBucketOptions(entries, bucketDefs, (entry) => entry.numeric);
};

const buildWeightOptions = (entries, attrMeta) => {
    // thresholds in grams: 100,200,300,400,500,600,700,800,900,1000
    const thresholds = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const normalizedUnit = normalizeText(attrMeta?.unit);
    const toGrams = (entryValue) => {
        // entryValue is numeric
        if (!entryValue && entryValue !== 0) return null;
        if (normalizedUnit === 'kg') return entryValue * 1000;
        // assume g by default; if unit contains 'g' or empty
        return entryValue;
    };

    const labelFormatter = (v) => (v >= 1000 ? `${formatInteger(v / 1000)} kg` : `${formatInteger(v)} g`);
    const bucketDefs = createThresholdBucketDefs(thresholds, 'weight', labelFormatter);
    // wrap getComparable to use grams
    const getComparable = (entry) => toGrams(entry.numeric);
    return buildBucketOptions(entries, bucketDefs, getComparable);
};

const buildRomOptions = (entries, attrMeta) => {
    // thresholds in GB: 32,64,128,256,512
    const thresholds = [32, 64, 128, 256, 512];
    const getComparable = (entry) => convertToBaseGB(entry.numeric, attrMeta?.unit);
    const bucketDefs = createThresholdBucketDefs(thresholds, 'rom', (v) => formatCapacityValue(v, 'GB'));
    return buildBucketOptions(entries, bucketDefs, getComparable);
};

// helper to convert numeric with unit to GB when unit indicates TB/MB/GB
const convertToBaseGB = (numeric, unit) => {
    if (numeric === null || numeric === undefined) return null;
    const u = normalizeText(unit || '');
    if (u === 'tb' || u === 't') return numeric * 1024;
    if (u === 'mb') return numeric / 1024;
    // assume GB or plain number already in GB
    return numeric;
};

const buildBatteryOptions = (entries) => {
    // thresholds in mAh
    const thresholds = [1000, 3000, 5000, 7000];
    const getComparable = (entry) => entry.numeric;
    const bucketDefs = createThresholdBucketDefs(thresholds, 'battery', (v) => `${formatInteger(v)} mAh`);
    return buildBucketOptions(entries, bucketDefs, getComparable);
};

const buildDpiOptions = (entries) => {
    const thresholds = [2000, 4000, 8000, 16000, 32000];
    const bucketDefs = createThresholdBucketDefs(thresholds, 'dpi', (v) => `${formatInteger(v)} DPI`);
    return buildBucketOptions(entries, bucketDefs, (entry) => entry.numeric);
};

export const buildDisplayOptions = (attrMeta = {}) => {
    const rawValues = sortFilterValues(attrMeta.availableValues || []);
    const numericEntries = rawValues
        .map((rawValue) => {
            const numeric = toNumericValue(rawValue);
            return numeric === null ? null : { rawValue, numeric };
        })
        .filter(Boolean)
        .sort((left, right) => left.numeric - right.numeric);

    if (numericEntries.length === 0) {
        return rawValues.map((rawValue, index) => ({
            key: `value-${index}-${rawValue}`,
            label: rawValue,
            values: [rawValue],
        }));
    }

    switch (getAttributeKind(attrMeta)) {
        case 'ram':
            return buildRamOptions(numericEntries, attrMeta);
        case 'ssd':
        case 'storage':
            return buildSsdOptions(numericEntries, attrMeta);
        case 'screen':
            return buildScreenOptions(numericEntries, attrMeta);
        case 'screen_refresh':
            return buildScreenRefreshOptions(numericEntries);
        case 'weight':
            return buildWeightOptions(numericEntries, attrMeta);
        case 'rom':
            return buildRomOptions(numericEntries, attrMeta);
        case 'battery':
            return buildBatteryOptions(numericEntries);
        case 'dpi':
            return buildDpiOptions(numericEntries);
        default:
            return buildGenericNumericOptions(numericEntries, attrMeta);
    }
};

export function normalizeFilterOptionsResponse(options) {
    if (!options || typeof options !== 'object') return null;

    return Object.entries(options).reduce((groups, [groupOrder, group]) => {
        groups[groupOrder] = {
            ...group,
            filterAttributes: (group?.filterAttributes || []).map((attr) => ({
                ...attr,
                displayOptions: buildDisplayOptions(attr),
            })),
        };
        return groups;
    }, {});
}

export { MAX_RANGE_GROUPS };


