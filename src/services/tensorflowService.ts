import { load } from "@tensorflow-models/universal-sentence-encoder";
import * as tf from "@tensorflow/tfjs";

class TensorflowService {
  private model: any = null;

  async initialize() {
    this.model = await load();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.model) await this.initialize();

    const embeddings = await this.model!.embed([text]);
    return Array.from(await embeddings.data());
  }

  async calculateCosineSimilarity(
    vector1: number[],
    vector2: number[],
  ): Promise<number> {
    const a = tf.tensor1d(vector1);
    const b = tf.tensor1d(vector2);

    // Cosine distance requires axis=0, reduction=Reduction.NONE, and dim parameter
    const similarity = tf.losses
      .cosineDistance(a, b, 0, undefined, tf.Reduction.NONE)
      .dataSync()[0];
    return 1 - similarity; // Convert distance to similarity
  }
}

export const tensorflowService = new TensorflowService();
