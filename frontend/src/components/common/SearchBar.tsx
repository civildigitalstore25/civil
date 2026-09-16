import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchBar = () => {
  const [category, setCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (category !== 'All Categories') {
      if (category === 'AutoCAD') navigate('/autocad-software/');
      else if (category === 'Revit') navigate('/revit/');
      else if (category === '3ds Max') navigate('/3ds-max/');
      else if (category === 'Excel Sheets') navigate('/excel-sheets/');
      else if (category === 'eBooks') navigate('/ebooks/');
      else navigate('/products');
    } else {
      navigate('/products');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl flex items-center bg-white border-2 border-[#F5A623] rounded-xl overflow-hidden shadow-sm focus-within:shadow-md focus-within:border-[#FFAA00] transition-all duration-200">
      {/* Category Dropdown */}
      <div className="relative shrink-0 border-r border-slate-200">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="appearance-none bg-white py-2.5 pl-3.5 pr-8 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none"
        >
          <option value="All Categories">All Categories</option>
          <option value="AutoCAD">AutoCAD</option>
          <option value="Revit">Revit</option>
          <option value="3ds Max">3ds Max</option>
          <option value="STAAD Pro">STAAD Pro</option>
          <option value="Excel Sheets">Excel Sheets</option>
          <option value="eBooks">eBooks</option>
        </select>
        {/* Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search AutoCAD, Revit, 3ds Max, Excel Sheets, eBooks..."
        className="w-full px-3.5 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none"
      />

      {/* Search Button */}
      <button
        type="submit"
        className="bg-[#F5A623] hover:bg-[#FFAA00] text-white px-5 py-3 flex items-center justify-center shrink-0 transition-colors duration-200 cursor-pointer"
        aria-label="Search"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 stroke-current" fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
};


export default SearchBar;
