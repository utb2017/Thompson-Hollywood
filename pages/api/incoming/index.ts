export default function handler(req:any, res:any) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
      }
    if (req.method === 'POST') {
        const body = JSON.parse(req.body)
      // Process a POST request
      console.log(body)
    } else {
      // Handle any other HTTP method
    }
  }