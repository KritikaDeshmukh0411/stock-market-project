const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];
const apiBase = "https://stocksapi-uhe1.onrender.com/api/stocks";

let selectedStock = 'AAPL'; // Default stock
let selectedTimeframe = '1M'; // Default timeframe

async function fetchStockData(stock) {
    const res = await fetch(`${apiBase}/getstocksdata?symbol=${stock}`);
    const data = await res.json();
    return data[selectedTimeframe] || [];
}

async function fetchStockProfile(stock) {
    const res = await fetch(`${apiBase}/getstocksprofiledata?symbol=${stock}`);
    return res.json();
}

async function fetchStockSummary(stock) {
    const res = await fetch(`${apiBase}/getstockstatsdata?symbol=${stock}`);
    return res.json();
}

async function loadStocks() {
    const stocksList = document.getElementById('stocksList');
    stocksList.innerHTML = "";

    for (let stock of stocks) {
        const data = await fetchStockSummary(stock);
        const price = data.price || 0;
        const change = data.change || 0;
        const changeClass = change >= 0 ? 'green' : 'red';

        const btn = document.createElement("button");
        btn.classList.add("stock-btn");
        btn.innerHTML = `${stock} <span class="${changeClass}">$${price.toFixed(2)} (${change.toFixed(2)}%)</span>`;
        btn.onclick = () => updateStock(stock);
        stocksList.appendChild(btn);
    }
}

async function updateStock(stock) {
    selectedStock = stock;
    await updateSummary();
    await updateChart(selectedTimeframe);
}

async function updateSummary() {
    const summary = await fetchStockProfile(selectedStock);
    const stats = await fetchStockSummary(selectedStock);

    document.getElementById("summary").innerHTML = `
        <strong>${summary.companyName || selectedStock}</strong><br>
        Market Cap: $${(stats.marketCap / 1e9).toFixed(2)}B <br>
        P/E Ratio: ${stats.peRatio || 'N/A'}
    `;
}

async function updateChart(timeframe) {
    selectedTimeframe = timeframe;
    const prices = await fetchStockData(selectedStock);

    const canvas = document.getElementById("stockChart");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;

    if (prices.length === 0) return;

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    ctx.beginPath();
    ctx.moveTo(0, canvas.height - ((prices[0] - minPrice) / (maxPrice - minPrice)) * canvas.height);

    for (let i = 1; i < prices.length; i++) {
        let x = (i / prices.length) * canvas.width;
        let y = canvas.height - ((prices[i] - minPrice) / (maxPrice - minPrice)) * canvas.height;
        ctx.lineTo(x, y);
    }

    ctx.stroke();
}

loadStocks();
updateStock('AAPL');
