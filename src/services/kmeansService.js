export async function fetchAPModel() {
  try {
    const response = await fetch("/api/kmeans/model_data_3d.json");
    const modelData = await response.json();
    return modelData;
  } catch (error) {
    alert("Failed to fetch AP model data, check console for more information");
    console.error("Failed to fetch AP model data:", error);
  }
}
