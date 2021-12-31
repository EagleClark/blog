# 使用说明

该分支用于发布，发布步骤如下：

在 `main` 分支执行：

```sh
npm run build
```

切换分支：

```sh
git checkout web-pub
```

将 `build` 文件夹拷贝到其它路径，然后将 `build` 目录下的文件拷贝到 `web-pub` 分支，覆盖所有文件，然后提交。