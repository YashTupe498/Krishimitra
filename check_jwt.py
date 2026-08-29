import jwt
anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrbmNhbmFvYW1qZ2tqamx4ZnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTY1NjYsImV4cCI6MjEwMzQ5MjU2Nn0.z08OZgpyDZULTvFWwFptasgOveHZm73ZBNTMkl-ZGQQ'
secret = 'ff2779e5-4ade-4124-b98d-39eafcb9bdbf'
try:
    decoded = jwt.decode(anon_key, secret, algorithms=['HS256'])
    print('SECRET IS CORRECT!')
except Exception as e:
    print('SECRET IS WRONG:', str(e))
