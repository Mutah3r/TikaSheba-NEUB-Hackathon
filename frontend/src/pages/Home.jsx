const Home = () => {
  const formatLongDate = (d) => {
    const day = d.getDate();
    const suffix = (n) => {
      if (n % 10 === 1 && n % 100 !== 11) return "st";
      if (n % 10 === 2 && n % 100 !== 12) return "nd";
      if (n % 10 === 3 && n % 100 !== 13) return "rd";
      return "th";
    };
    const month = d.toLocaleString("en-GB", { month: "long" }).toLowerCase();
    const year = d.getFullYear();
    return `${day}${suffix(day)} ${month}, ${year}`;
  };

  const todayStr = formatLongDate(new Date());

  return (
    <div className="min-h-[50vh] p-6">
      <h1 className="text-2xl font-bold mb-2">This is homepage</h1>
      <p className="text-sm text-[#0c2b40]/80">Today is {todayStr}</p>
    </div>
  );
};

export default Home;
