import app from './app';
import { config } from './config/config';

const port = config.server.port;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});