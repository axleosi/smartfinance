// mocks/chatGPTMock.js (create this file)

export function getMockConsultingResponse(inputData) {
  // You can customize this based on inputData if you want
  return {
    advice: "Based on your recent expenses, consider reducing dining out to save more.",
    savingsTip: "Try budgeting 20% less on discretionary spending next month.",
    investmentSuggestion: "Look into low-cost index funds to grow your savings steadily.",
    inputSummary: inputData.extractedText ? inputData.extractedText.slice(0, 100) + "..." : "No text provided"
  };
}
