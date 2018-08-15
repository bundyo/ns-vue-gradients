<template>
	<Page xmlns="http://www.nativescript.org/tns.xsd" loaded="onPageLoaded">
		<ActionBar class="action-bar" title="Gradients" />
		<ScrollView>
			<StackLayout>
				<StackLayout class="bottom-gradient" height="200" marginTop="16">
					<Label text="background: linear-gradient(to bottom, orangered, green, lightblue);" textWrap="true" />
				</StackLayout>
				<StackLayout class="left-gradient" height="200" marginTop="16">
					<Label text="background: linear-gradient(to left, orangered, green, lightblue);" textWrap="true" />
				</StackLayout>
				<StackLayout class="right-gradient" height="200" marginTop="16">
					<Label text="background: linear-gradient(to right, orangered, green, lightblue);" textWrap="true" />
				</StackLayout>
				<StackLayout class="degree-gradient" height="200" marginTop="16">
					<Label text="background: linear-gradient(45deg, orangered, green, lightblue);" textWrap="true" />
				</StackLayout>
				<StackLayout class="two-color-gradient" height="200" marginTop="16">
					<Label text="background: linear-gradient(-45deg, orangered, lightblue);" textWrap="true" />
				</StackLayout>
				<StackLayout class="background-image" height="200" marginTop="16">
					<Label text="background-image:linear-gradient(to bottom, orangered, green, lightblue);" textWrap="true" />
				</StackLayout>
			</StackLayout>
		</ScrollView>
	</Page>
</template>

<script>
export default {
    data () {
        return {
        };
    },
}
</script>

<style scoped>
Label {
    padding: 8;
    color:white;
}

.bottom-gradient {
	border-radius: 20;
    background: linear-gradient(to bottom, orangered, green, lightblue);
}

.left-gradient {
    background: linear-gradient(to left, orangered, green, lightblue);
}

.right-gradient {
    background: linear-gradient(to right, orangered, green, lightblue);
}

.degree-gradient {
    background: linear-gradient(45deg, orangered, green, lightblue);
}

.two-color-gradient {
    background: linear-gradient(-45deg, orangered, lightblue);
}

.background-image {
    background-image:linear-gradient(to bottom, orangered, green, lightblue);
}
</style>
