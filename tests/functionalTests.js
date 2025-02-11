/* eslint-disable max-len */

import test from 'ava';
import execute from 'execa';
import fs from 'fs-promise';
import countLines from 'line-count';

const command = '../dist/cli.js';

test('non-existent template name should cause error', async function (t) {
  const templ = 'foo';
  const commandArguments = ['-s', 'monokai', '-t', templ];
  const {stderr: actual} = await execute(command, commandArguments);

  const expected = `fatal: Could not find a template called '${templ}'.
See \'base16-builder ls-templates\' for a list of available templates.`;
  t.is(actual, expected);
});

test('templates with special name should cause error', async function (t) {
  const templs = ['schemes', 'templates'];
  for (const templ of templs) {
    const commandArguments = ['-s', 'monokai', '-t', templ];
    const {stderr: actual} = await execute(command, commandArguments);

    const expected = `fatal: Could not find a template called '${templ}'.
See \'base16-builder ls-templates\' for a list of available templates.`;
    t.is(actual, expected);
  }
});

test('non-existent scheme name should cause error', async function (t) {
  const scheme = 'bar';
  const commandArguments = ['-s', scheme, '-t', 'i3wm'];
  const {stderr: actual} = await execute(command, commandArguments);

  const expected = `fatal: Could not find a scheme called '${scheme}'.
See \'base16-builder ls-schemes\' for a list of available schemes.`;
  t.is(actual, expected);
});

test('schemes with special name should cause error', async function (t) {
  const schemes = ['schemes', 'templates'];
  for (const scheme of schemes) {
    const commandArguments = ['-s', scheme, '-t', 'i3wm'];
    const {stderr: actual} = await execute(command, commandArguments);

    const expected = `fatal: Could not find a scheme called '${scheme}'.
See \'base16-builder ls-schemes\' for a list of available schemes.`;
    t.is(actual, expected);
  }
});

test('invalid command arguments should cause error', async function (t) {
  const invalidCommandArguments = [
    [],
    ['-t', 'i3wm'],
    ['-s', 'oceanicnext'],
    ['--template', 'i3wm'],
    ['--scheme', 'oceanicnext']
  ];
  for (const commandArguments of invalidCommandArguments) {
    const {stderr: actual} = await execute(command, commandArguments);

    t.ok(actual.match(/^fatal: You did not supply valid arguments\. See 'base16-builder -h' for help\/examples\./));
  }
});

test('help arguments should cause help to be output', async function (t) {
  const {stdout: actual} = await execute(command, ['--help']);

  t.ok(actual.match(/Usage/));
  t.ok(actual.match(/Commands/));
  t.ok(actual.match(/Options/));
  t.ok(actual.match(/Example/));
});

test('with alias help arguments should cause help to be output', async function (t) {
  const {stdout: actual} = await execute(command, ['-h']);

  t.ok(actual.match(/Usage/));
  t.ok(actual.match(/Commands/));
  t.ok(actual.match(/Options/));
  t.ok(actual.match(/Example/));
});

test('valid template and scheme cause output file to be written to console', async function (t) {
  const scheme = 'oceanicnext';
  const templ = 'i3wm';
  const commandArguments = ['-s', scheme, '-t', templ];

  const {stdout: actual} = await execute(command, commandArguments);

  t.ok(/set \$base00 1B2B34/.test(actual));
});

test('with aliases, valid template and scheme cause output file to be written to console', async function (t) {
  const scheme = 'oceanicnext';
  const templ = 'i3wm';
  const commandArguments = ['--scheme', scheme, '--template', templ];

  const {stdout: actual} = await execute(command, commandArguments);

  t.ok(/set \$base00 1B2B34/.test(actual));
});

test('scheme list contains all schemes', async function (t) {
  const {stdout: output} = await execute(command, ['ls-schemes']);
  const actual = countLines(output);

  const expected = (await fs.readdir('../db/schemes')).length;
  t.is(actual, expected);
});

test('no schemes in scheme list end with ".yml"', async function (t) {
  const {stdout: actual} = await execute(command, ['ls-schemes']);

  t.false(/\.yml$/.test(actual));
});

test('scheme list is sorted alphabetically', async function (t) {
  const {stdout: actual} = await execute(command, ['ls-schemes']);

  const expected = actual.split('\n').sort().join('\n');

  t.is(actual, expected);
});

test('template list contains all templates', async function (t) {
  const {stdout: output} = await execute(command, ['ls-templates']);
  const actual = countLines(output);

  const expected = (await fs.readdir('../db/templates')).length;
  t.is(actual, expected);
});

test('no templates in template list end with ".nunjucks"', async function (t) {
  const {stdout: actual} = await execute(command, ['ls-templates']);

  t.false(/\.nunjucks$/.test(actual));
});

test('template list is sorted alphabetically', async function (t) {
  const {stdout: actual} = await execute(command, ['ls-templates']);

  const expected = actual.split('\n').sort().join('\n');

  t.is(actual, expected);
});

test('valid template and scheme paths cause output file to be written to console', async function (t) {
  const schemePath = '../db/schemes/oceanicnext.yml';
  const templPath = '../db/templates/i3wm.nunjucks';
  const commandArguments = ['--scheme', schemePath, '--template', templPath];

  const {stdout: actual} = await execute(command, commandArguments);

  t.ok(/set \$base00 1B2B34/.test(actual));
});

test('with aliases, valid template and scheme paths cause output file to be written to console', async function (t) {
  const schemePath = '../db/schemes/oceanicnext.yml';
  const templPath = '../db/templates/i3wm.nunjucks';
  const commandArguments = ['-s', schemePath, '-t', templPath];

  const {stdout: actual} = await execute(command, commandArguments);

  t.ok(/set \$base00 1B2B34/.test(actual));
});

test('non-existent template path should cause error', async function (t) {
  const templPath = 'foo/i3wm.nunjucks';
  const commandArguments = ['--scheme', 'monokai', '--template', templPath];
  const {stderr: actual} = await execute(command, commandArguments);

  const expected = `fatal: Could not find a template called '${templPath}'.
See \'base16-builder ls-templates\' for a list of available templates.`;
  t.is(actual, expected);
});

test('non-existent scheme path should cause error', async function (t) {
  const schemePath = 'foo/oceanicnext.yml';
  const commandArguments = ['-s', schemePath, '-t', 'i3wm'];
  const {stderr: actual} = await execute(command, commandArguments);

  const expected = `fatal: Could not find a scheme called '${schemePath}'.
See \'base16-builder ls-schemes\' for a list of available schemes.`;
  t.is(actual, expected);
});

test('valid template name and scheme path cause output file to be written to console', async function (t) {
  const schemePath = '../db/schemes/oceanicnext.yml';
  const templ = 'i3wm';
  const commandArguments = ['--scheme', schemePath, '--template', templ];

  const {stdout: actual} = await execute(command, commandArguments);

  t.ok(/set \$base00 1B2B34/.test(actual));
});

test('valid template path and scheme name cause output file to be written to console', async function (t) {
  const scheme = 'oceanicnext';
  const templPath = '../db/templates/i3wm.nunjucks';
  const commandArguments = ['--scheme', scheme, '--template', templPath];

  const {stdout: actual} = await execute(command, commandArguments);

  t.ok(/set \$base00 1B2B34/.test(actual));
});
