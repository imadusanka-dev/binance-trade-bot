import { tradeSide } from "./constants.js";

const calculateNadarayaWatsonEnvelope = (data, length, h, mult) => {
  const y = [];
  for (let i = 0; i < length; i++) {
    let sum = 0;
    let sumw = 0;

    for (let j = 0; j < length; j++) {
      const w = Math.exp(-((i - j) ** 2) / (h ** 2 * 2));
      sum += data[j]?.closePrice * w;
      sumw += w;
    }

    const y2 = sum / sumw;
    y.push(y2);
  }

  const envelope = [];
  const mae = mult * calculateMeanAbsoluteError(data, y);

  for (let i = 1; i < length; i++) {
    const y1 = y[i - 1];

    if (data[i]?.closePrice > y1 + mae && data[i + 1]?.closePrice < y1 + mae) {
      const label = {
        time: data[i]?.closeTime,
        price: data[i]?.closePrice,
        tradeDirection: tradeSide.SELL,
      };
      envelope.push(label);
    }
    if (data[i]?.closePrice < y1 - mae && data[i + 1]?.closePrice > y1 - mae) {
      const label = {
        time: data[i]?.closeTime,
        price: data[i]?.closePrice,
        tradeDirection: tradeSide.BUY,
      };
      envelope.push(label);
    }
  }

  return { envelope };
};

function calculateMeanAbsoluteError(data1, data2) {
  if (data1.length !== data2.length) {
    throw new Error("Data lengths do not match");
  }

  let sum = 0;
  for (let i = 0; i < data1.length; i++) {
    sum += Math.abs(data1[i]?.closePrice - data2[i]);
  }

  return sum / data1.length;
}

export { calculateNadarayaWatsonEnvelope };
