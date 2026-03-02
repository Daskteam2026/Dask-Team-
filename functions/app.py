from main import app
from mangum import Mangum

# Netlify will call this handler as a Lambda function
handler = Mangum(app)
