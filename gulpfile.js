var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', function() {
   gulp.run('sass');
});

gulp.task('sass', function() {
    gulp.src('./css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});
