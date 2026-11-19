// Local storage model for Server Price Calculator (Client-only mode)

export async function checkBackendHealth() {
  return null;
}

export async function fetchQuotesApi() {
  try {
    return JSON.parse(localStorage.getItem('sp_quotes')) || [];
  } catch {
    return [];
  }
}

export async function saveQuoteApi(quote) {
  try {
    const local = JSON.parse(localStorage.getItem('sp_quotes')) || [];
    const updated = [quote, ...local.filter((q) => q.id !== quote.id)];
    localStorage.setItem('sp_quotes', JSON.stringify(updated));
    return { success: true, quote };
  } catch (e) {
    console.error('Failed to update local storage:', e);
    return { success: false, quote };
  }
}

export async function deleteQuoteApi(id) {
  try {
    const local = JSON.parse(localStorage.getItem('sp_quotes')) || [];
    const updated = local.filter((q) => q.id !== id);
    localStorage.setItem('sp_quotes', JSON.stringify(updated));
    return { success: true };
  } catch (e) {
    console.error('Failed to update local storage on delete:', e);
    return { success: false };
  }
}

export async function fetchRatesApi() {
  try {
    return JSON.parse(localStorage.getItem('sp_rates')) || null;
  } catch {
    return null;
  }
}

export async function saveRatesApi(rates) {
  try {
    localStorage.setItem('sp_rates', JSON.stringify(rates));
  } catch (e) {
    console.error('Failed to cache rates locally:', e);
  }
}
