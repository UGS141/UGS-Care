const mongoose = require('mongoose');

// Schema for language strings
const languageStringSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    namespace: {
      type: String,
      required: true,
      trim: true,
      default: 'common',
    },
    platform: {
      type: String,
      enum: ['all', 'web', 'android', 'ios', 'admin'],
      default: 'all',
    },
    translations: {
      type: Map,
      of: String,
      required: true,
      default: {},
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isHtml: {
      type: Boolean,
      default: false,
    },
    variables: [{
      name: String,
      description: String,
    }],
    status: {
      type: String,
      enum: ['active', 'pending_review', 'deprecated'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Schema for supported languages
const languageSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nativeName: {
      type: String,
      required: true,
      trim: true,
    },
    isRTL: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    translationProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    flagIcon: String,
    dateFormat: {
      short: String, // e.g., 'MM/DD/YYYY' or 'DD/MM/YYYY'
      medium: String, // e.g., 'MMM D, YYYY' or 'D MMM YYYY'
      long: String, // e.g., 'MMMM D, YYYY' or 'D MMMM YYYY'
    },
    timeFormat: {
      short: String, // e.g., 'h:mm a' or 'HH:mm'
      medium: String, // e.g., 'h:mm:ss a' or 'HH:mm:ss'
      long: String, // e.g., 'h:mm:ss a z' or 'HH:mm:ss z'
    },
    numberFormat: {
      decimalSeparator: String, // e.g., '.' or ','
      thousandsSeparator: String, // e.g., ',' or '.'
      currencyFormat: String, // e.g., '$#,##0.00' or '#,##0.00 €'
    },
  },
  {
    timestamps: true,
  }
);

// Schema for currency settings
const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    symbolPosition: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },
    decimalPlaces: {
      type: Number,
      default: 2,
    },
    decimalSeparator: {
      type: String,
      default: '.',
    },
    thousandsSeparator: {
      type: String,
      default: ',',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    conversionRate: {
      type: Number,
      default: 1,
    }, // Relative to base currency
    lastUpdated: Date,
  },
  {
    timestamps: true,
  }
);

// Schema for unit settings
const unitSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['weight', 'volume', 'length', 'temperature', 'pressure', 'other'],
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: String,
    conversionFactor: Number, // Relative to base unit in the category
    isBase: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for locale settings
const localeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      ref: 'Language',
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      ref: 'Currency',
    },
    dateFormat: String,
    timeFormat: String,
    timezone: String,
    firstDayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 0, // 0 = Sunday, 1 = Monday, etc.
    },
    measurementSystem: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    defaultUnits: {
      weight: String,
      volume: String,
      length: String,
      temperature: String,
      pressure: String,
    },
    phoneFormat: String,
    postalCodeFormat: String,
    postalCodeRegex: String,
    addressFormat: {
      type: Map,
      of: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index for language strings
languageStringSchema.index({ key: 1, namespace: 1, platform: 1 }, { unique: true });

// Create indexes for faster queries
languageStringSchema.index({ namespace: 1 });
languageStringSchema.index({ platform: 1 });
languageStringSchema.index({ status: 1 });
languageStringSchema.index({ tags: 1 });

languageSchema.index({ code: 1 });
languageSchema.index({ isActive: 1 });
languageSchema.index({ isDefault: 1 });

currencySchema.index({ code: 1 });
currencySchema.index({ isActive: 1 });
currencySchema.index({ isDefault: 1 });

unitSchema.index({ category: 1, code: 1 }, { unique: true });
unitSchema.index({ category: 1, isBase: 1 });

localeSchema.index({ code: 1 });
localeSchema.index({ language: 1, country: 1 });
localeSchema.index({ isActive: 1 });
localeSchema.index({ isDefault: 1 });

// Methods for language strings
languageStringSchema.methods.getTranslation = function (languageCode, fallbackLanguage = 'en') {
  if (this.translations.has(languageCode)) {
    return this.translations.get(languageCode);
  }
  
  if (fallbackLanguage && this.translations.has(fallbackLanguage)) {
    return this.translations.get(fallbackLanguage);
  }
  
  return this.key; // Return the key as last resort
};

// Static method to get all translations for a namespace
languageStringSchema.statics.getNamespaceTranslations = async function (namespace, languageCode) {
  const strings = await this.find({ namespace, status: 'active' });
  
  const translations = {};
  strings.forEach(string => {
    translations[string.key] = string.getTranslation(languageCode);
  });
  
  return translations;
};

// Currency conversion method
currencySchema.methods.convert = function (amount, targetCurrency) {
  if (this.code === targetCurrency.code) {
    return amount;
  }
  
  // Convert to base currency first (if not already base)
  const amountInBase = amount / this.conversionRate;
  
  // Then convert to target currency
  return amountInBase * targetCurrency.conversionRate;
};

// Unit conversion method
unitSchema.methods.convert = function (value, targetUnit) {
  if (this.category !== targetUnit.category) {
    throw new Error(`Cannot convert between different unit categories: ${this.category} and ${targetUnit.category}`);
  }
  
  if (this.code === targetUnit.code) {
    return value;
  }
  
  // Convert to base unit first (if not already base)
  const valueInBase = value * this.conversionFactor;
  
  // Then convert to target unit
  return valueInBase / targetUnit.conversionFactor;
};

const LanguageString = mongoose.model('LanguageString', languageStringSchema);
const Language = mongoose.model('Language', languageSchema);
const Currency = mongoose.model('Currency', currencySchema);
const Unit = mongoose.model('Unit', unitSchema);
const Locale = mongoose.model('Locale', localeSchema);

module.exports = {
  LanguageString,
  Language,
  Currency,
  Unit,
  Locale,
};