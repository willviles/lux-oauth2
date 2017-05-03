export default function routes() {
  this.resource('oauth', {
    only: []
  }, function(){
    this.post('/token', 'token');
  });

  this.resource('users', {
    only: ['index']
  });
}
