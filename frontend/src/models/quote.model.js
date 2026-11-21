// Builds one structured quotation used by BOTH the on-screen quote and the PDF.
export const MODULE_LABELS = {
  mfi: ['MFI module', 'Loan cycles, collections & centre meetings'],
  tracking: ['Live tracking', 'Field staff location & route history'],
  hr: ['HR', 'Staff records, payroll & attendance'],
  mobileApp: ['Mobile app', 'Field collections & customer mobile app'],
  jewelLoan: ['Jewel loan', 'Gold appraisal, interest cycles & pledge custody'],
  backup: ['Automated backup', 'Database snapshots, retention & recovery'],
};

const BACKUP_TXT = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function buildQuote({ inp, res, rates, billingCycle, quoteNo, date }) {
  const gstPct = rates.gstPct ?? 18;
  const yearly = billingCycle === 'yearly';
  const valid = new Date(date);
  valid.setDate(valid.getDate() + 15);

  const modules = ['mfi', 'tracking', 'hr', 'mobileApp', 'jewelLoan', 'backup']
    .filter((k) => !!inp[k])
    .map((k) => {
      const [label, base] = MODULE_LABELS[k];
      let hint = base;
      if (k === 'tracking' && inp.trackedUsers) hint += ` (${inp.trackedUsers} staff tracked)`;
      if (k === 'backup') hint += ` - ${BACKUP_TXT[inp.backupFreq || 'daily']}`;
      return { key: k, label, hint };
    });

  const hasPlan = res.monthly > 0 || res.oneTimeTotal > 0;

  // One-time: itemised licence fees + deployment/configuration + setup & onboarding
  const oneTimeLines = [
    ...res.feeLines,
    ...(res.markup > 0 ? [['Cloud deployment & configuration', res.markup]] : []),
    ...(res.setupFee > 0 ? [['Setup & onboarding', res.setupFee]] : []),
  ];

  const recurring = {
    label: yearly ? 'Hosting & infrastructure (12 months, 1 month free)' : 'Hosting & infrastructure (per month)',
    sub: yearly ? res.yearly : res.monthly,
    gst: yearly ? res.gst.yearly : res.gst.monthly,
    total: yearly ? res.yearlyTotal : res.monthlyTotal,
  };
  const oneTime = { lines: oneTimeLines, sub: res.oneTimeBase, gst: res.gst.oneTime, total: res.oneTimeTotal };

  const plans = {
    monthly: { sub: res.monthly, gst: res.gst.monthly, total: res.monthlyTotal },
    yearly: {
      sub: res.yearly,
      gst: res.gst.yearly,
      total: res.yearlyTotal,
      saving: res.monthlyTotal,
      perMonth: Math.round(res.yearlyTotal / 12),
    },
  };

  return {
    plans,
    quoteNo,
    date,
    validTill: valid,
    gstPct,
    billingCycle,
    yearly,
    hasPlan,
    client: inp.client?.trim() || '',
    contact: inp.contactNo?.trim() || '',
    scope: { staff: inp.users || 0, branches: inp.branches || 0, customers: inp.clients || 0 },
    modules,
    recurring,
    oneTime,
    firstYearTotal: recurring.total * (yearly ? 1 : 12) + oneTime.total,
    monthlyEquivalent: yearly ? Math.round(res.yearlyTotal / 12) : res.monthlyTotal,
    saving: yearly ? res.monthlyTotal : 0,
  };
}
