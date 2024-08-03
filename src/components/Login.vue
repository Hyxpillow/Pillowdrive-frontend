<template>
    <div class="page-container">
        <div style="display: flex;
        justify-content: center; 
        align-items: center;  
        height: 100vh;">
            <div class="container">
                <div style="width: 350px;padding: 50px 30px;background-color: white;border-radius: 5px;">
                    <div style="display: flex;align-items: center;font-size: 20px;margin-bottom: 20px;">
                        <el-image style="width: 40px;" src="`${$pb}assets/pillow.png`" />
                        <el-text
                            style="color: #92b4df;font-size: 25px; font-weight:700;margin-left: 10px;">PillowDrive</el-text>
                    </div>
                    <el-form :model="form" label-width="auto" style="max-width: 600px" @keyup.enter.native="onSubmit">
                        <el-form-item>
                            <el-input v-model="form.email" placeholder="邮箱" :prefix-icon="User" />
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="form.password" placeholder="密码" :prefix-icon="Lock" show-password />
                        </el-form-item>
                        <el-form-item>
                            <el-button style="width: 100%;" @click="onSubmit">登录</el-button>
                        </el-form-item>
                    </el-form>
                    <div style="display: flex; align-items: center;">
                        <div style="flex:1; text-align: right;">
                            <router-link to="/register">注册</router-link> |
                            <router-link to="/reset">忘记密码</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container {
    background: #92b4df;
    min-height: 100vh;
    /* 确保背景覆盖整个页面 */
}
</style>

<script lang="ts" setup>
import { reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const form = reactive({
    email: '',
    password: ''
})

const onSubmit = () => {
    fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            email: form.email,
            password: form.password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code == 200) {
            location.href = "/home"
        } else {
            ElMessageBox.alert(data.message)
        }
    })
    .catch(error => { ElMessageBox.alert("后端未启用") }
    );
}
</script>