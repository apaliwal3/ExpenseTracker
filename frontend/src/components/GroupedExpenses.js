import React from 'react';

const groupByKey = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key] || 'Unspecified';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

const GroupedExpenses = ({ expenses, onDelete, groupBy, sortOption }) => {
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortOption === 'amount_asc') return a.amount - b.amount;
    if (sortOption === 'amount_desc') return b.amount - a.amount;
    return new Date(b.created_at) - new Date(a.created_at); // recent first
  });

  const grouped = groupByKey(sortedExpenses, groupBy);

  return (
    <div>
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-4">
          <h5 className="text-primary">{group}</h5>
          <div className="list-group">
            {items.map(exp => (
              <div key={exp.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>${Number(exp.amount).toFixed(2)}</strong> – {exp.description || 'No description'}
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(exp.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupedExpenses;