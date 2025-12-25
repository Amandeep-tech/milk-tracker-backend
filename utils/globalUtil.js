exports.getMilkSummaryQuantityWise = (entries) => {
    //  entries = [
    //     { quantity: 1, rate: 48 },
    //     { quantity: 1, rate: 48 },
    //     { quantity: 1.5, rate: 48 },
    //     { quantity: 2, rate: 48 }
    //   ];

    // We want 
    // [
    //     {
    //       '1 L': '2 days',
    //       '1.5 L': '1 days',
    //       '2 L': '1 days'
    //     }
    //   ]
    if(!entries) return {};

    const quantityMap = {};
    for(const entry of entries) {
        const label = `${entry.quantity} L`
        quantityMap[label] = (quantityMap[label] || 0) + 1;
    }
    // quantityMap is now
    // {
        //       '1 L': '2',
        //       '1.5 L': '1',
        //       '2 L': '1'
        //     }
    // now I need to append day/days to each value of key :)
    const summary = {}
    for(const [label, dayCount] of Object.entries(quantityMap)) {
        summary[label] = `${dayCount} ${dayCount > 1 ? 'days' : 'day'}`
    }
    return summary;
}

exports.getMonthRange = (yearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const startDate = new Date(year, month - 1, 1); // YYYY-MM-01
  const endDate = new Date(year, month, 1);       // first day of next month

  return {
    start: startDate.toISOString().slice(0, 10), // YYYY-MM-DD
    end: endDate.toISOString().slice(0, 10),
  };
};
