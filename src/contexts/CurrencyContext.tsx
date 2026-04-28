import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  currency: string;
  locale: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  locale: 'en-US',
  isLoading: false,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [locale, setLocale] = useState('en-US');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Fallback to browser locale first
        const browserLocale = navigator.language || 'en-US';
        setLocale(browserLocale);
        
        // Use Intl to get default currency for the locale
        // Note: Not all browsers support this, so we'll do a best effort
        try {
          const numberFormat = new Intl.NumberFormat(browserLocale, { style: 'currency', currency: 'USD' });
          const parts = numberFormat.formatToParts(1);
          const detectedCurrency = parts.find(p => p.type === 'currency')?.value || 'USD';
          // This doesn't actually give us the currency CODE usually, it gives the symbol.
        } catch (e) {}

        // Use Geolocation if permitted
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Use a free reverse geocoding API to get country code
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
              const data = await response.json();
              const countryCode = data.address?.country_code?.toUpperCase();

              if (countryCode) {
                const countryToCurrency: { [key: string]: { currency: string, locale: string } } = {
                  'US': { currency: 'USD', locale: 'en-US' },
                  'GB': { currency: 'GBP', locale: 'en-GB' },
                  'EU': { currency: 'EUR', locale: 'en-EU' },
                  'FR': { currency: 'EUR', locale: 'fr-FR' },
                  'DE': { currency: 'EUR', locale: 'de-DE' },
                  'JP': { currency: 'JPY', locale: 'ja-JP' },
                  'IN': { currency: 'INR', locale: 'en-IN' },
                  'CN': { currency: 'CNY', locale: 'zh-CN' },
                  'CA': { currency: 'CAD', locale: 'en-CA' },
                  'AU': { currency: 'AUD', locale: 'en-AU' },
                  'BR': { currency: 'BRL', locale: 'pt-BR' },
                  'RU': { currency: 'RUB', locale: 'ru-RU' },
                  'KR': { currency: 'KRW', locale: 'ko-KR' },
                  'MX': { currency: 'MXN', locale: 'es-MX' },
                };

                if (countryToCurrency[countryCode]) {
                  setCurrency(countryToCurrency[countryCode].currency);
                  setLocale(countryToCurrency[countryCode].locale);
                }
              }
            } catch (error) {
              console.error("Error fetching country from location", error);
            } finally {
              setIsLoading(false);
            }
          }, (error) => {
            console.error("Geolocation error", error);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, locale, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
