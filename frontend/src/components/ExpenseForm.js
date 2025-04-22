import React, {useState} from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable'

const ExpenseForm = ({onAdd, categories}) =>{
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryOption, setCategoryOption] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!amount || !categoryOption){
      alert('Please fill in amount and category');
      return;
    }

    try{
      const category = categoryOption.value;
      const response = await axios.post('http://localhost:5001/api/expenses', {
        amount,
        description,
        category
      });
      console.log(response.data);
      onAdd(response.data);
      setAmount('');
      setDescription('');
      setCategoryOption(null);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} style = {{marginBottom: '1rem'}}>
      <input
        type = 'number'
        placeholder = 'Amount'
        value = {amount}
        onChange = {(e) => setAmount(e.target.value)}
        required
      />
      <CreatableSelect
        placeholder="Select or create category"
        isClearable
        onChange={setCategoryOption}
        value={categoryOption}
        options={categoryOptions}
      />
      <input
        type = 'text'
        placeholder = 'Description'
        value = {description}
        onChange = {(e) => setDescription(e.target.value)}
      />
      <button type = 'submit'>Add Expense</button>
      <button type = 'button' onClick = {() => {setAmount(''); setDescription(''); setCategoryOption(null)}}>Clear</button>
    </form>
  );
};

export default ExpenseForm;