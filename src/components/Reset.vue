<template>
    <div class="page-container">
        <div style="display: flex;
      justify-content: center; 
      align-items: center;  
      height: 100vh;">
            <div class="container">
                <div style="width: 350px;padding: 50px 30px;background-color: white;border-radius: 5px;">
                    <div style="display: flex;align-items: center;font-size: 20px;margin-bottom: 20px;">
                        <el-image style="width: 40px;" src="../../public/pillow.png" />
                        <el-text
                            style="color: #92b4df;font-size: 25px; font-weight:700;margin-left: 10px;">PillowDrive</el-text>
                    </div>
                    <el-form :model="form" label-width="auto" style="max-width: 600px">
                        <el-form-item>
                            <el-input v-model="form.email" placeholder="邮箱" :prefix-icon="User" />
                        </el-form-item>
                        <el-form-item style="display: flex;
                          justify-content: space-between;
                          align-items: center;">
                            <div style="width: 215px;">
                                <el-input v-model="form.code" placeholder="验证码" :prefix-icon="Lock" />
                            </div>
                            <el-button v-if="!sms.disabled" style="width: 65px ;margin-left: 10px;"
                                @click="getCode">发送</el-button>
                            <el-button v-else style="width: 65px ;margin-left: 10px;" disabled>{{ sms.count
                                }}s</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="form.password" placeholder="新密码" :prefix-icon="Lock" show-password />
                        </el-form-item>
                        <el-form-item>
                            <el-button style="width: 100%;" @click="onSubmit">重置密码 </el-button>
                        </el-form-item>
                    </el-form>
                    <div style="display: flex; align-items: center;">
                        <div style="flex:1; text-align: right;">
                            <a href="/login">登录</a>
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

const sms = reactive({
    disabled: false,
    total: 60,
    count: 0
})

const timerHandler = () => {
    sms.count = sms.total
    sms.disabled = true
    let timer = setInterval(() => {
        if (sms.count > 1) {
            sms.count--
        } else {
            sms.disabled = false
            clearInterval(timer)
        }
    }, 1000)
}

// do not use same name with ref
const form = reactive({
    email: '',
    password: '',
    code: ''
})

const getCode = () => {
    fetch('http://127.0.0.1:8080/user/get_code', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: form.email})
    })
    .then(response => response.json())
    .then(data => {
        if (data.code == 200) {
            timerHandler()
            ElMessageBox.alert("验证码已发送至您的邮箱")
        } else {
            ElMessageBox.alert(data.message)
        }
    })
    .catch(error => {
        ElMessageBox.alert("后端未启用")
    });
}

const onSubmit = () => {
    // 将表单数据转换为JSON字符串
    const data = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: form.email,
            password: form.password,
            code: form.code
        })
    };

    fetch('http://127.0.0.1:8080/user/reset_password', data)
    .then(response => response.json())
    .then(data => {
        if (data.code == 200) {
            location.href = "/login"
        } else {
            ElMessageBox.alert(data.message)
        }
    })
    .catch(error => {ElMessageBox.alert("后端未启用")});
}
</script>