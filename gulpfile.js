let gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    pump = require('pump'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean');
imagemin = require('gulp-imagemin');

gulp.task('copy-html', () => {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('imagemin', () =>
    gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
);

gulp.task('clean-dist', () => {
    return gulp.src('!./dist/modules/, ./dist/', {read: false})
        .pipe(clean());
});

// tasks for CSS files

gulp.task('clean-css', () => {
    return gulp.src('./src/css/', {read: false})
        .pipe(clean());
});

gulp.task('sass', ['clean-css'], () => {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass())
        .on('error', function (err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(gulp.dest('./src/css/'));
});
gulp.task('autoprefix', ['sass'], () => {
    return gulp.src('./src/css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./src/css/'))
});

gulp.task('concat-css', ['autoprefix'], () => {
    return gulp.src('./src/css/**/*.css')
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./src/css/'));
});

gulp.task('minify-css', ['concat-css'], () => {
    return gulp.src('./src/css/style.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./src/css/'));
});

gulp.task('copy-css', ['minify-css'], () => {
    return gulp.src('./src/css/style.css')
        .pipe(gulp.dest('./dist/css/'))
});

// tasks for JS files

gulp.task('clean-js', () => {
    return gulp.src('./dist/js/script.js', {read: false})
        .pipe(clean());
});

gulp.task('concat-js', ['clean-js'], () => {
    return gulp.src('./src/js/**/*.js')
        .pipe(concat('script.js'))
        .pipe(gulp.dest('./src/js/'));
});

gulp.task('minify-js', ['concat-js'], (cb) => {
    pump([
            gulp.src('./src/js/script.js'),
            uglify(),
            gulp.dest('./src/js/')
        ],
        cb
    );
});

gulp.task('copy-js', ['minify-js'], () => {
    return gulp.src('./src/js/script.js')
        .pipe(gulp.dest('./dist/js/'))
});

gulp.task('serve', ['copy-html', 'copy-css', 'copy-js', 'imagemin'], () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    gulp.watch('./src/**/*.html', ['copy-html']).on('change', browserSync.reload);
    gulp.watch('./src/scss/**/*.scss', ['copy-css']).on('change', browserSync.reload);
    gulp.watch('./src/js/**/*.js', ['copy-js']).on('change', browserSync.reload);
});

gulp.task('dev', ['clean-dist'], () => {
    gulp.start('serve');
});

gulp.task('build', ['clean-dist'], () => {
    gulp.start('copy-html');
    gulp.start('copy-css');
    gulp.start('copy-js');
});