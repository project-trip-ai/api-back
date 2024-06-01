export async function test(req, res) {
  try {
    res.status(200).json('Hello world');
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
}
