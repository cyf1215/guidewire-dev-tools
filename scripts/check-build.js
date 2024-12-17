const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'dist/main/index.js',
  'dist/preload/index.js',
  'dist/renderer/index.html'
];

function checkPackageJson() {
  console.log('\n=== package.json 检查 ===');
  const pkg = require('../package.json');
  console.log('Main entry:', pkg.main);
  console.log('Dependencies:', Object.keys(pkg.dependencies).length);
  console.log('DevDependencies:', Object.keys(pkg.devDependencies).length);
}

function checkDirectoryStructure() {
  console.log('\n=== 目录结构检查 ===');
  const directories = ['dist', 'dist/main', 'dist/preload', 'dist/renderer'];

  directories.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    try {
      const stats = fs.statSync(fullPath);
      console.log(`✓ ${dir}/`);
      console.log(`  创建时间: ${stats.birthtime}`);
      console.log(`  修改时间: ${stats.mtime}`);

      const files = fs.readdirSync(fullPath);
      console.log(`  文件数量: ${files.length}`);
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const fileStats = fs.statSync(filePath);
        console.log(`    - ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`);
      });
    } catch (err) {
      console.error(`✗ ${dir}/ 不存在或无法访问`);
      console.error(`  错误: ${err.message}`);
    }
  });
}

function checkFiles() {
  console.log('\n=== 构建文件检查 ===');
  let allFilesExist = true;

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    try {
      const stats = fs.statSync(fullPath);
      console.log(`✓ ${file}`);
      console.log(`  大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`  修改时间: ${stats.mtime}`);
    } catch (err) {
      console.error(`✗ ${file} 不存在!`);
      console.error(`  错误: ${err.message}`);
      allFilesExist = false;
    }
  }

  checkPackageJson();
  checkDirectoryStructure();

  if (!allFilesExist) {
    console.error('\n❌ 某些必需文件缺失!');
    process.exit(1);
  }

  console.log('\n✓ 所有必需文件都存在');
}

checkFiles();
