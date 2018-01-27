'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const svgo = require('gulp-svgo');
const svgSymbols = require('gulp-svg-symbols');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sequence = require('run-sequence');
const rimraf = require('rimraf');
const nodemon = require('gulp-nodemon');
const path = require('path');

gulp.task('clean', function (done) {
  rimraf('./public', done);
});

gulp.task('js', () => {
  gulp.src([
    'node_modules/mustache/mustache.min.js',
    'node_modules/moment/moment.js',
    'node_modules/moment/locale/ru.js',
    'src/**/*.js'
  ])
    .pipe(concat('common.js'))
    .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('style', () => {
  gulp.src('src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest('./public/assets/css'))
    .pipe(csso())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('./public/assets/css'));
});

gulp.task('svg', () => {
  gulp.src('src/img/svg/*.svg')
    .pipe(svgo())
    .pipe(svgSymbols({
      templates: ['default-svg']
    }))
    .pipe(rename('_symbols.html'))
    .pipe(gulp.dest('src/templates/components/'));
});

gulp.task('images', () => {
  gulp.src('src/img/*.*')
    .pipe(imagemin({
      optimizationLevel: 7
    }))
    .pipe(gulp.dest('./public/assets/img'));
});

gulp.task('fonts', () => {
  gulp.src('src/fonts/*')
    .pipe(gulp.dest('./public/assets/fonts'));
});

gulp.task('build', function (done) {
  sequence(
    'clean',
    'style',
    'js',
    'svg',
    'images',
    'fonts',
    done
  );
});

gulp.task('start', ['build'], function () {
  nodemon({
    script: 'index.js',
    ext: 'js html scss svg',
    ignore: ['public', 'svg-symbols.svg'],

    tasks: function (changedFiles) {
      var tasks = [];

      changedFiles.forEach(function (file) {
        // Listen to only files from src folder
        if (path.dirname(file).indexOf('src') < 0) {
          return;
        }

        const ext = path.extname(file);

        const extToTasks = {
          '.js': ['js'],
          '.scss': ['style'],
          '.svg': ['svg'],
          '.jpg': ['images'],
          '.jpeg': ['images'],
          '.png': ['images']
        };

        if (extToTasks[ext]) {
          tasks = tasks.concat(tasks, extToTasks[ext]);
        }
      });
      return tasks;
    }
  });
});
