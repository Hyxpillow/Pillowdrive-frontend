<template>
    <div class="common-layout">
      <el-container>
        <el-header style="display: flex; justify-content: space-between; align-items: center; padding-top: 30px;">
            <div style="display: flex; align-items: center;">
                <el-image style="width: 80px; height: 80px;" src="/pillow.png" />
                <el-text style="
                    color: #92b4df;
                    font-size: 40px; 
                    font-weight: 700;
                    margin-left: 10px;">PillowDrive</el-text>
            </div>
            <div style="display: flex; align-items: center;">   
                <el-button @click="logout">退出登录</el-button>
            </div>
        </el-header>
        <el-divider/>
        <el-main>
            <div style="display: flex; justify-content: space-between; align-items: center;
                margin-top: -20px; margin-bottom: 10px;">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item>
                        <div style="cursor: pointer;" @click="openHome()"> 个人空间 </div> 
                    </el-breadcrumb-item>
                    <el-breadcrumb-item v-for="(dir, index) in reactiveComponent.allPaths">
                        <div @click="openURL(index)" 
                            style="cursor: pointer;">{{ dir }}</div>
                    </el-breadcrumb-item>
                </el-breadcrumb>
                <input type="file" ref="fileInput" style="display:none;" @change="handleFileChange"/>
                <div>
                    <el-button v-if="reactiveComponent.selectCount==1" @click="renameFile()">重命名</el-button>
                    <el-button @click="createFolder()">新建文件夹</el-button>
                    <el-button @click="uploadFiles()">上传</el-button>
                    <el-button @click="downloadFiles()">下载</el-button>
                    <el-button @click="deleteFiles()" >删除</el-button>
                </div>
            </div>
            <el-table ref="fileTable" 
                :data="reactiveComponent.allFiles" 
                style="width: 100%" 
                empty-text="文件夹为空"
                @select="handleSelection">
                <el-table-column type="selection" width="55" />
                <el-table-column label="文件名" width="200">
                    <template #default="scope">
                        <div v-if="scope.row.directory" 
                            style="cursor: pointer;"
                            @click="openDir(scope.row.filename)">
                            <el-icon><Folder /></el-icon>
                            {{ scope.row.filename }}
                        </div>
                        <div v-else>
                            <el-icon ><Document /></el-icon>
                            {{ scope.row.filename }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column property="lastModified" label="修改时间" width="200" />
                <el-table-column property="size" label="大小" />
            </el-table>
        </el-main>
      </el-container>
    </div>
  </template>
  


<script lang="ts" setup>
    import { Document, Folder } from '@element-plus/icons-vue'
    import { ref, onMounted, reactive } from 'vue'
    import { ElMessageBox } from 'element-plus'

    const UPLOAD_URL = 'http://123.249.127.238:25567/file/upload'
    const DOWNLOAD_URL = 'http://123.249.127.238:25567/file/download'
    const DELETE_URL = 'http://123.249.127.238:25567/file/delete'
    const RENAME_URL = 'http://123.249.127.238:25567/file/rename'
    const CREATE_URL = 'http://123.249.127.238:25567/file/create'
    const LIST_URL = 'http://123.249.127.238:25567/file/list'

    var reactiveComponent = reactive({
        allFiles: [],
        allPaths: [],
        selectCount: 0
    });
    const handleSelection = (selection) => {reactiveComponent.selectCount = selection.length}
    const getCurrentPath = () => {return reactiveComponent.allPaths.length ? reactiveComponent.allPaths.join('/') + '/' : ''}
    const fileTable = ref(null)

    const fileInput = ref(null)
    const uploadFiles = () => {
        fileInput.value.click()
    }
    const handleFileChange = () => {
        if (!fileInput.value.files.length) return;  // 如果用户没有文件要上传，直接返回
        if (fileInput.value.files[0].size / 1024 / 1024 >= 50) {
            ElMessageBox.alert("上传文件的大小不能超过50M");
            return;
        };
        const formData = new FormData();
        formData.append('file', fileInput.value.files[0]);
        formData.append('path', getCurrentPath()); // 添加路径字段

        fetch(UPLOAD_URL, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.code == 200) {
                var url = reactiveComponent.allPaths.join('/')
                jumpToUrl(url)
            } else if (data.code == 400) {
                ElMessageBox.alert("登录过期")
                location.href = "/login"
            } else {
                ElMessageBox.alert(data.message)
                openHome()
            }
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
    }

    const downloadFiles = () => {
        const prefixPath = getCurrentPath()
        const pathList = fileTable.value.getSelectionRows().map(item => prefixPath + item.filename)
        fetch(DOWNLOAD_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                pathList: pathList
            })
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            if (pathList.length > 1 || fileTable.value.getSelectionRows()[0].directory) {
                link.download = "files.zip"
            } else {
                link.download = fileTable.value.getSelectionRows()[0].filename
            }
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    
    const deleteFiles = () => {
        const prefixPath = getCurrentPath()
        fetch(DELETE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                pathList: fileTable.value.getSelectionRows().map(item => prefixPath + item.filename)
            })
        })
        .then(response => {return response.json()})
        .then(data => {
            if (data.code == 200) {
                var url = reactiveComponent.allPaths.join('/')
                jumpToUrl(url)
            } else if (data.code == 400) {
                ElMessageBox.alert("登录过期")
                location.href = "/login"
            } else {
                ElMessageBox.alert(data.message)
                openHome()
            }
            })
            .catch(error => {
                ElMessageBox.alert("后端未启用")
            }
        );
    }

    const renameFile = () => {
        const fileName = fileTable.value.getSelectionRows()[0].filename
        const prefixPath = getCurrentPath()
        
        ElMessageBox.prompt('新文件名', '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /.+/,
            inputErrorMessage: '不能为空',
        })
        .then(({ value }) => {
            fetch(RENAME_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    src: prefixPath + fileName,
                    dst: prefixPath + value,
                })
            })
            .then(response => {
                return response.json(); // 解析JSON响应体
            })
            .then(data => {
            if (data.code == 200) {
                var url = reactiveComponent.allPaths.join('/')
                jumpToUrl(url)
            } else if (data.code == 400) {
                ElMessageBox.alert("登录过期")
                location.href = "/login"
            } else {
                ElMessageBox.alert(data.message)
                openHome()
            }
            })
            .catch(error => {
                ElMessageBox.alert("后端未启用")
            });
        })
    }

    const createFolder = () => {
        ElMessageBox.prompt('新文件夹名', '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /.+/,
            inputErrorMessage: '不能为空',
        }).then(({ value }) => {
            const prefixPath = getCurrentPath()
            fetch(CREATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    path: prefixPath + value
                })
            })
            .then(response => {
                return response.json(); // 解析JSON响应体
            })
            .then(data => {
            if (data.code == 200) {
                var url = reactiveComponent.allPaths.join('/')
                jumpToUrl(url)
            } else if (data.code == 400) {
                location.href = "/login"
            } else {
                ElMessageBox.alert(data.message)
            }
            })
            .catch(error => {
                ElMessageBox.alert("后端未启用")
                console.log(error)
            });
        })
    }

    const logout = () => {
        document.cookie = "sessionid= ; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        location.href = "/login"
    }

    const openURL = (index) => {
        reactiveComponent.allPaths = reactiveComponent.allPaths.slice(0, index + 1);
        var path = getCurrentPath()
        jumpToUrl(path)
    }
    
    const openDir = (dir) => {
        reactiveComponent.allPaths.push(dir)
        var path = getCurrentPath()
        jumpToUrl(path)
    }

    const openHome = () => {
        reactiveComponent.allPaths = []
        jumpToUrl("")
    }

    const jumpToUrl = (path) => {
        fetch(LIST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({path: path})
        })
        .then(response => {return response.json();})
        .then(data => {
            if (data.code == 200) {
                reactiveComponent.allFiles = []
                data.data.allFiles.forEach(function(file) {
                    reactiveComponent.allFiles.push(file);
                });
                reactiveComponent.allFiles.sort(compare("directory"));
                reactiveComponent.selectCount = 0
            } else if (data.code == 400) {
                ElMessageBox.alert("登录过期")
                location.href = "/login"
            } else {
                ElMessageBox.alert("目录不存在")
                openHome()
            }
            })
        .catch(error => {
            ElMessageBox.alert("后端未启用")
            console.log(error)
        });
    }

    function compare(p){ 
        return function(m,n){
            var a = m[p];
            var b = n[p];
            return b - a; //升序
        }
    }

    onMounted(async () => {
        await jumpToUrl("");
    });
</script>
  