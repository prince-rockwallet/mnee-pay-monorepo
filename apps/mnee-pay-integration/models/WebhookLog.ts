import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhookLog extends Document {
  receivedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const WebhookLogSchema: Schema = new Schema(
  {
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog || mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);

export default WebhookLog;