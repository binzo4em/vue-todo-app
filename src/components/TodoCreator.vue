<template>
  <div>
      <button v-on:click="createTodo">
          <i class="material-icons">add</i>
      </button>
      <!--
          - 한글 사용을 위해 $event.target.value를 사용
          - bind 속성, 일반 속성, 이벤트 속성 순서로 작성하는 것이 코딩 컨벤션
          - keypress.enter : 엔터키를 눌렀을 때 이벤트 정의
        -->
      <input
        v-bind:value="title"
        v-bind:placeholder="placeholder"
        type="text"
        v-on:input="title = $event.target.value"
        v-on:keypress.enter="createTodo"
        />
  </div>
</template>

<script>
export default {
  data () {
    return {
      title: '',
      placeholder: '할 일을 추가하세요!'
    }
  },
  methods: {
    createTodo () {
      // 값을 입력하지 않은 경우를 확인
      const validatedTitle = this.title && this.title.trim()
      if (!validatedTitle) {
        alert('유효하지 않은 제목입니다!')
        this.title = this.title.trim()
        return
      }

      // $emit으로 상위 부모에 create-todo라는 이벤트를 발생 시키면서 this.title을 전달
      // vuex에서는 sotre를 사용하기 때문에 $emit으로 부모에게 이벤트를 전달하지 않아도 된다.
      // this.$emit('create-todo', this.title)
      // namespace를 사용하기 때문에 모듈 이름을 앞에 사용해야 한다. todoApp/createTodo
      this.$store.dispatch('todoApp/createTodo', this.title)
      this.title = '' // input창 초기화

      // 화면이 렌더링된 후 처리하기 위해 nextTick을 사용
      // 아이템을 추가후 스크롤을 제일 아래로 이동 시킨다.
      this.$nextTick(() => {
        // window.scrollTo(x, y) x축, y축의 인자값을 받는다.
        // x축으로는 움직지지 않기 때문에 0, y축은 body의 높이 값으로 설정하면 맨 아래로 이동
        window.scrollTo(0, document.body.scrollHeight)
      })
    }
  }
}
</script>

<style>

</style>
