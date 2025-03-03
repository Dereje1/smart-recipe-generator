import mongoose from 'mongoose';

const AIgeneratedSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: Object, required: true },
    model: { type: String, required: false }
  }, { timestamps: true });
  
  export default mongoose.models.AIgenerated || mongoose.model('AIgenerated', AIgeneratedSchema);