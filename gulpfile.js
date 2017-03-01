const gulp = require('gulp'),
      gulpChanged = require('gulp-changed'),
      babel = require('gulp-babel'),
      browserSync = require('browser-sync').create();;

// watcher task as default
gulp.task('default', ['browser-sync', 'watch']);

// js watcher task
gulp.task('watch', () => {
  gulp.watch('src/assets/js/*.js', ['compile']);
});

// babel compiler task
gulp.task('compile', () => {
  gulp
    .src('src/assets/js/*.js')
    .pipe(gulpChanged('dist/js/'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist/js/'))
});

// browser sync task
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './',
      directory: true
    },
    open: false,
    files: [
      'dist/js/main.js',
      'dist/js/Utils.class.js',
      'src/index.html',
      'src/assets/css/styles.css'
    ]
  });
});
