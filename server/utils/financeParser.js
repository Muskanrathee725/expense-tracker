const categoryKeywords = {
  food: 'Food',
  grocery: 'Food',
  restaurant: 'Food',
  transport: 'Transport',
  metro: 'Transport',
  fuel: 'Transport',
  shop: 'Shopping',
  shopping: 'Shopping',
  medical: 'Health',
  health: 'Health',
  bill: 'Bills',
  electricity: 'Bills',
  internet: 'Bills',
  salary: 'Income',
  freelance: 'Income',
};

const parseFinancePrompt = (text) => {
  const input = String(text || '').toLowerCase().trim();
  const amountMatch = input.match(/(\d+(?:\.\d+)?)/);
  if (!amountMatch) {
    return { ok: false, message: 'I could not find an amount. Example: "spent 600 on food".' };
  }

  const amount = Number(amountMatch[1]);
  const isExpense = /(spent|spend|pay|paid|expense|bought|purchase|debit|minus|sent|gave)/.test(input);
  const isIncome = /(received|receive|recieved|recievd|credit|credited|earned|salary|income|got|deposit|deposited|added|inflow|\+)/.test(input);
  const type = isIncome && !isExpense ? 'income' : 'expense';

  let category = type === 'income' ? 'Income' : 'Other';
  for (const [word, mapped] of Object.entries(categoryKeywords)) {
    if (input.includes(word)) {
      category = mapped;
      break;
    }
  }

  let title = type === 'income' ? 'Income Entry' : 'Expense Entry';
  const onMatch = input.match(/on\s+([a-zA-Z\s]+)/);
  if (onMatch?.[1]) title = onMatch[1].trim().replace(/\b\w/g, (m) => m.toUpperCase());
  if (type === 'income' && category === 'Income' && input.includes('salary')) title = 'Salary Credit';

  return {
    ok: true,
    entry: {
      title,
      amount,
      type,
      category,
      date: new Date().toISOString().slice(0, 10),
    },
  };
};

module.exports = {
  parseFinancePrompt,
};
