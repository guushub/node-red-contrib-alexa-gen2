const gulp = require('gulp');
const concat = require('gulp-concat');
 
gulp.task('concat-html', function() {
  return gulp.src('./src/nodes/**/*.html')
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./dist'));
  });