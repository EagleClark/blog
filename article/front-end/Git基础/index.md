# Git基础

> 首发于：2020-10-25

## 安装

### Mac 安装

Mac 系统是默认自带了 git 的，一般不用自己安装。

### Windows 安装

[windows 版本 git 下载地址](https://git-scm.com/download/win)

### 最小配置

#### 配置 user 信息

```sh
$ git config --global user.name "xxx"
$ git config --global user.email "xxxxx"
$ git config --list --global
```

#### config 的三个作用域

缺省等同于 local，global对当前用户所有仓库有效，system对系统所有登录的用户有效（不常用）。

```sh
$ git config --local
$ git config --global
$ git config --system
```

## Git 仓库

### 已有项目代码新建

```sh
$ cd 项目代码所在的文件夹
$ git init
```

### 新建的项目直接用 Git 管理

```sh
$ cd 某个文件夹
$ git init your_project # 会在当前路径下创建和项目名称同名的文件夹，里面有个裸仓库 .git
$ cd your_project
```

### 仓库备份

| 常用协议   | 语法格式                                                     | 说明                                           |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------- |
| 本地协议1  | /path/to/repo.git                                            | 哑协议，没有传输进度                           |
| 本地协议2  | file:///path/to/repo.git                                     | 智能协议，有传输进度，比哑协议速度快           |
| http/https | http://git-server.com:port/path/to/repo.git  https://git-server.com:port/path/to/repo.git | 平时接触到的都是智能协议，用户名密码确保安全性 |
| Ssh        | user@git-server.com:path/to/repo.git                         | 工作中最常用的智能协议，需要配置公、私钥       |

```sh
$ git clone --bare /path/to/repo.git reponame # --bare 是不包含工作区
$ git clone --bare file:///path/to/repo.git reponame
$ git remote add remoteRepoName file:///path/to/remoteRepoName.git # 本地仓库跟远程库建立连接
$ git push --set-upstream remoteRepoName repo # 推送变动到远程库
```

```sh
$ git remote add github git@github.com:xxx/xxx.git # 与 github 的仓库建立连接，起名叫 github
$ git fetch github master # 把远端的分支拉到本地，但不会将本地分支与远程分支进行合并
$ git merge --allow-unrelated-histories github/master
$ git push github --all # 推送本地仓库都远端
$ git push github master # 单独推送某个分支
```

### 删除仓库

```sh
$ rm -rf .git
```

### 远程仓库

#### 创建SSH key

- 创建 github 账户，并登录
- 点击头像下拉菜单，Settings -> SSH and GPG keys -> New SSH key
- 填入 Title
- ssh-keygen -t rsa -C "youremail@example.com" 邮箱需要是 github 注册的邮箱
- 一通回车之后会在~/.ssh 目录下生成三个文件
- cat id_rsa.pub
- 复制内容，填入 github 网站中就完成了

判断是否能连接成功

```sh
$ ssh -T git@github.com
```

#### 推送文件到远程仓库

- 在 github 中创建一个新的 repository(仓库)
- 创建之后如图所示:

![](./image/pic1.awebp)

```sh
# 按照 github 提示的命令操作即可
$ echo "# gitdemo" >> README.md
$ git init
$ git add README.md
$ git commit -m "first commit"
$ git remote add origin https://github.com/EagleClark/gitdemo.git
$ git push -u origin master
```

#### 远程仓库更新到本地

```sh
$ git pull 远程仓库地址
```

#### 克隆远程仓库

```sh
$ git clone 远程仓库地址
```

## Git 的暂存区

工作目录里面做的变更一般来说最好要先放入暂存区，进行暂存。

使用 git status 可以查看当前工作区中的文件状态，如果这个文件没有暂存过，那么意味着 git 还没有对该文件进行管理，会提示“Untracked files”，暂存之后就可以就行 commit 了

```sh
$ git status # 查看当前目录的状态
$ git add -u # 全部提交到暂存区
$ git add 文件名或者路径
$ git add .
```

```sh
$ git reset --hard # 清除暂存区里面所有内容，慎重操作
```

### 暂存区与 HEAD 比较

```sh
$ git diff --cached
```

### 工作区与暂存区比较

```sh
$ git diff
$ git diff -- 文件名
```

### 暂存区恢复成和 HEAD 一样

```sh
$ git reset HEAD
$ git reset --hard
```

### 工作区恢复成和暂存区一样

```sh
$ git checkout
$ git checkout -- 文件名 # 最好用这个
```

### 取消暂存区部分文件的更改

```sh
$ git reset HEAD -- 文件名 文件名 # 可以多个文件
```

### 将暂存区的文件进行提交

```sh
$ git commit -m"your description"
$ git commit -am"your description" # 可以提交已经已经跟踪过但修改后为再次 add 的文件
```

## 日志查看

```sh
$ git log # 查看当前分支的所有日志
$ git log --oneline # 查看所有日志的精简版
$ git log -n4 # 查看最近4条日志
$ git log -3 # 查看最近3条日志
$ git log -n2 --oneline # 查看最近2条日志的精简版
```

```sh
$ git git log --all # 查看所有版本的日志
$ git git log --all -n4 # 查看所有版本的日志最近4条日志
$ git git log --all --graph # 以图形化的方式查看所有版本的日志
$ git git log --oneline --all -n4 --graph # 以图形化的方式查看所有版本最近4条的日志的精简版
```

```sh
$ gitk # 图形界面查看
$ gitk --all
```

## 分支

```sh
$ git branch # 查看本地分支的精简信息
$ git branch -v # 查看本地分支信息
$ git branch -a # 查看本地以及远端的所有分支的精简信息
$ git branch -av # 查看本地以及远端的所有分支信息，-va 也可以
$ git branch 分支名称 # 创建分支
```

```sh
$ git branch -d 分支名称 # 删除分支，没有完全合并可能会报错，需要一些处理，这种方式相对安全
$ git branch -D 分支名称 # 删除分支，强制删除，确实是不想要了
```

```sh
$ git checkout 分支名称 # 切换分支
```

## 标签

### 查看标签

```sh
$ git tag
$ git tag --list
```

```sh
$ git tag -l “v1.8.5*” # 模糊搜索
```
### 创建标签

```sh
$ git tag -a 标签 -m “标签描述” # -m -a 都可以可以省略
$ git tag 标签
```

```sh
$ git tag -a 标签 hash 值 # 给某个commit 补标签
```
### 查看标签对应信息

```sh
$ git show 标签
```

### 共享标签

```sh
$ git push origin 标签 # git push 不会推送标签信息，需要这样显式推送
$ git push origin --tags # 推送所有标签到远程仓库
```
### 删除标签

```sh
$ git tag -d 标签 # 删除本地标签
$ git push origin —-delete 标签 # 删除远程标签
```
### 检出标签

```sh
$ git checkout 标签 # 注意：会出现分离头指针的情况
```

## cherry-pick

对于多分支的代码库，将代码从一个分支转移到另一个分支是常见需求。

这时分两种情况。一种情况是，你需要另一个分支的所有代码变动，那么就采用合并（`git merge`）。另一种情况是，你只需要部分代码变动（某几个提交），这时可以采用 Cherry pick。

### 基本用法

```sh
$ git cherry-pick hash 值 # 将指定提交应用于当前分支，会在当前分支创建一个新的提交
$ git cherry-pick hash值1 hash值2 # 转移多个提交
$ git cherry-pick hash值1..hash值2 # 转移多个连续的提交，前面一个提交必须早于后面一个提交，此命令不包含 hash值1这个提交
$ git cherry-pick hash值1^..hash值2 # 包含 hash值1 这个提交
```

### 配置项

- -e —-edit 打开外部编辑器
- -n —-no-commit 只更新到工作区和暂存区，不产生新的提交
- -x 提交末尾追加一行(cherry picked from commit...)
- -s —-signoff 在提交末尾添加一行操作者的签名，表示是谁进行了这个操作

### 代码冲突处理

- —-continue 用户解决冲突后第一步将修改的文件加入到暂存区，第二步执行此命令，让cherry pick继续
- —-abort 发生冲突之后放弃合并，回到以前那样
- —-quit 发生冲突之后退出，但是不回到操作前的样子

## .git 目录结构

> .git
>
>  >  HEAD 指向当前分支
>  >  config 存储配置邮箱用户名等信息的地方
>  >  description
>  >  hooks
>  >  index
>  >  info
>  >  logs
>  >  objects 指向具体的对象 commit、tree、blob
>  >  refs
>  >
>  >  > heads 存放所有的分支
>  >  > remotes
>  >  > tags 存放一个 hash 值指向某个 commit

一个 commit 对应一个 tree，tree 是某个 commit 的所有的文件快照，tree 对应着各个 blob，只要文件内容相同即使文件名称不一样都是同一个 blob。

```sh
$ git cat-file -p hash值或者文件名 # 查看内容
$ git cat-file -t hash值或者文件名 # 查看类型

# 进入到 heads 目录下
$ git cat-file -t master # commit
$ git cat-file -p master
# tree 6d3d71137704bf22a99dc0a9d55a8096d49d9e2e
# parent e0080e319936b82d44aad19368a003f9eb050782
# author eagleclark <eaglelljl@163.com> 1599491312 +0800
# committer eagleclark <eaglelljl@163.com> 1599491312 +0800
$ git cat-file -p 6d3d71137704b
# 100755 blob 58b21fe5e9164bf56825fdee8bd4d67c117856b4	.gitignore
# 100755 blob 54ef09430b11a9e551ddfe1107287e168c6f0e11	README.md
# 040000 tree ea16243c25eef37ebb5d7ed668750486fbae05ba	build
# 100755 blob 51605efef9f73c2f6128c587606cd46383c6cb52	package-lock.json
# 100755 blob 380a9fa444eafa405758d27199b1a795b8d29783	package.json
# 040000 tree 6f216505e98b746617ba01bd2265af44a06e9e99	public
# 040000 tree fb3e52ecf26f8ad0c79805f5622ff22b276343d0	src
$ git cat-file -p 54ef09430b11 # 会显示 README.md 的内容
```

## 使用小技巧

### 帮助查看

```sh
$ git help log
$ git help --web log # 在浏览器上查看 log 的帮助文档
```

### 文件重命名

```sh
$ git mv filename newfilename
```

### 分离头指针 detached head

首先，你 checkout 到了某一个 commit 而不是分支，然后你基于这个 commit 去修改了一些代码，然后又产生了一个新的 commit。

这时你很可能因为某个原因需要 checkout 到某个分支，这时 git 会提示你，有个 commit 没加到这个分支，你最好给这个 commit 创建一个新的分支。否则这个 commit 很可能会被清理。

### HEAD

可以用 HEAD 来指代当前使用的这个 commit。

```sh
$ git diff HEAD^ # 对比上一个 commit
$ git diff HEAD~1 # 对比上一个 commit

$ git diff HEAD^^ # 对比上2个 commit
$ git diff HEAD~2 # 对比上2个 commit
```

### 修改最近的 commit 的 message

```sh
$ git commit --amend # 进入一个编辑环境，对最近的一次 commit 进行变更
```

### 修改老旧的 commit 的 message

```sh
$ git rebase -i 某一个 commit 的 hash 值 # 变基的方式来修改，在自己的分支上可以用，集成分支上慎用

# 第一步要改哪个 message 就把对应的 pick 变成 r
# 第二步修改 message
```

### 连续多个 commit 整理成1个

```sh
$ git rebase -i 某一个 commit 的 hash 值 # 变基的方式来修改，在自己的分支上可以用，集成分支上慎用

# 第一步要合并哪几个 message 就把对应的 pick 变成 s
# 第二步修改 message，没带井号的内容都会出现在新的 message 中
```

### 把几个不连续的 commit 整理成1个

```sh
$ git rebase -i 某一个 commit 的 hash 值 # 变基的方式来修改，在自己的分支上可以用，集成分支上慎用

# 第一步把要修改的那个 commit 的更前面一个 commit 的 hash 值记录一下，并写到最全面 pick hash值
# 第二步要合并哪几个 message 就把对应的 pick 变成 s，并改变顺序
# 第三步修改 message，没带井号的内容都会出现在新的 message 中
```

### 删除最近几次 commit

```sh
$ git reset --hard hash值 # 想回退到的 commit 的 hash 值
```

### 查看不同 commit 指定文件的差异

```sh
$ git diff branch1 branch2
$ git diff branch1 branch2 —- filename
$ git diff hash1 hash2 —- filename
```

### 删除文件

```sh
$ git rm filename # 等同于在工作区先 rm 文件，再 git add 文件
```

### 保存和恢复工作区进度

```sh
$ git stash # 保存工作区进度，新建的文件保存不了，慎用
$ git stash list # 查看保存的进度列表
$ git stash apply # 恢复之前的进度，保留 list 里面的内容
$ git stash pop # 恢复之前进度，并删除 list 中的内容
$ git stash pop stash@{0} # 恢复并删除指定版本的进度
```

### 指定不需要 Git 管理的文件

* 创建 .gitignore 文件

### Git 多人单分支集成协作

#### 不同人修改了不同文件

- 每次 push 本地代码之前先 pull 一下远端代码即可

#### 不同的人修改相同文件的不同区域

- 首先直接 push 肯定是不行的，可以先 pull 下来
- 或者先 fetch 下来，然后使用 merge 进行操作，Git 自动就可以进行合并操作

#### 不同的人修改了同一文件的同一区域

- 这时候 pull 的时候就会提示有文件冲突，直接 push 和 merge 都是不行了，需要手动解决冲突

#### 同时变更了文件名和文件内容

- Git 能感知到文件名的变化，会自动更新文件名，直接 pull 代码的时候就会把文件修改过来

#### 多人修改同一个文件的文件名

- pull 下来之后 Git 会报冲突，自行处理

### Git 多人集成协作禁忌

- 禁用 push -f 命令

```sh
$ git push -f # 强制推送代码
```

- 禁止向远端主分支进行变基操作
