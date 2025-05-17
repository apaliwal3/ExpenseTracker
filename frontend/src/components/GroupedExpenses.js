import React from 'react';

const groupByKey = (arr, key) =>
  arr.reduce((acc, item) => {
    let group;

    if (key === 'category') {
      group = item.category || 'Uncategorized';
    } else if (key === 'user') {
      group = item.contributor || 'Unassigned';
    } else {
      group = 'Other';
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

const GroupedExpenses = ({ expenses, onDelete, groupBy, sortOption }) => {
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortOption === 'amount_asc') return a.amount - b.amount;
    if (sortOption === 'amount_desc') return b.amount - a.amount;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const grouped = groupByKey(sortedExpenses, groupBy);

  return (
    <div className="mt-4">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-4">
          <h5 className="text-primary fw-semibold mb-3">{group}</h5>
          <div className="border-top">
            {items.map(exp => (
              <div
                key={exp.id}
                className="d-flex justify-content-between align-items-center py-3 border-bottom"
              >
                <div>
                  <div className="fw-bold">${Number(exp.amount).toFixed(2)}</div>
                  <div className="text-muted small">{exp.description || 'No description'}</div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">{exp.contributor || 'User'}</span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(exp.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupedExpenses;
