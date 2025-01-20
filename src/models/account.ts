import mongoose, { Model }  from 'mongoose';

export interface AccountType {
    provider: string,
    type: string,
    providerAccountId: string,
    access_token: string,
    expires_at: number,
    scope: string,
    token_type: string,
    id_token: string
}

// define the schema for our user model
const accountSchema = new mongoose.Schema({
  provider: String,
  type: String,
  providerAccountId: String,
  access_token: String,
  expires_at: Number,
  scope: String,
  token_type: String,
  id_token: String
});

const Account: Model<AccountType> = mongoose.models.Account || mongoose.model<AccountType>('Account', accountSchema);

export default Account