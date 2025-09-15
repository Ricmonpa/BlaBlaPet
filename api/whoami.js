export default function handler(req, res) {
  res.status(200).json({
    project: 'blabla-pet-ai',
    env: process.env.BLOB_READ_WRITE_TOKEN ? 'token-exists' : 'token-missing'
  });
}