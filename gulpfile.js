'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps'); // карты для sass
var browserSync = require('browser-sync').create(); // сервер
var useref = require('gulp-useref'); // для объединения js или css файлов
var gulpIf = require('gulp-if'); // для условий
var uglify = require('gulp-uglify'); // минифицирует js и удаляем комментарии
var cssnano = require('gulp-cssnano'); // минифицирует css и удаляем комментарии
var imagemin = require('gulp-imagemin'); // минифицирует картинки - не очень сильно, поэтому tinypng(500)
var tinypng = require('gulp-tinypng'); // tinypng plugin
var cache = require('gulp-cache'); // плагин для кеширования результатов работы
var del = require('del'); // удаляет неиспользуемые файлы
var runSequence = require('run-sequence'); // для поочердного запуска тасков

/*** Development ***/
// Запуск watcher
gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch('files/src/sass/**/*.scss', ['sass']);
    // Перезагружаем при изменении JS или HTML
    gulp.watch('files/src/*.html', browserSync.reload);
    gulp.watch('files/src/js/**/*.js', browserSync.reload);
});

// Компиляция по умолчанию
gulp.task('default', function(callback){
    runSequence(['sass', 'browserSync', 'watch'], callback)
});

// Запуск сервера browserSync
gulp.task('browserSync', function(){
    browserSync.init({
        server: {
            baseDir: 'files/src',
            stream: true
        }
    })
});

// Работа с SASS
gulp.task('sass', function(){
    return gulp.src('files/src/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            includePaths: [
                'node_modules/normalize.css/'
                //'node_modules/susy/sass'
            ]
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('files/src/css'))
        .on('end', browserSync.reload) // Мгновенная перезагрузка изменений
});

/*** Production ***/
// Запуск компиляции файлов для porduction
gulp.task('build', function(callback){
    runSequence('clean:dist',
        ['sass', 'useref', 'images', 'fonts'],
        callback
    )
});

// Очистка файлов кеша
gulp.task('cache:clean', function(callback){
    return cache.cleanAll(callback)
});

// Запуск очистки папки dist
gulp.task('clean:dist', function(){
    return del.sync('files/dist');
});

// Запуск копирования шрифтов
gulp.task('fonts', function(){
    return gulp.src('files/src/fonts/**/*')
        .pipe(gulp.dest('files/dist/fonts'))
});

// Запуск минификации изображений
gulp.task('images', function() {
    return gulp.src('files/src/img/**/*.+(png|jpg|jpeg)')
    /*.pipe(cache(imagemin({
     interlaced: true
     })))*/
        .pipe(cache(tinypng('Eas7Fx7pbGifv3wIHt-T7md3-OsouFxN')))
        .pipe(gulp.dest('files/dist/images'))
});

// Запуск минификации js и css(копирует также и html)
gulp.task('useref', function(){
    return gulp.src('files/src/*.html')
        .pipe(useref())
        // Минифицируем с помощью uglify, если это js файл
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('files/dist'))
});