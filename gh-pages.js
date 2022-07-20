import { publish } from 'gh-pages';

publish(
 'build', // path to public directory
 {
  branch: 'gh-pages',
  repo: 'https://github.com/lilsoosh/loaengravings.git',
  user: {
   name: 'lilsoosh',
   email: 'andrewianwoo@yahoo.com'
  },
  dotfiles: true
  },
  () => {
   console.log('Deploy Complete!');
  }
);