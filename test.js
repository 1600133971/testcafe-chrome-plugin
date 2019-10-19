import { Selector, t, ClientFunction } from "testcafe";

fixture `fixture demo`
  .page `http://localhost:8085/testcafe/example/index.html`;

test("TestCafeJS test", async t => {
  await t
    .click(Selector("input#populate"))
    .click(Selector("button.swal-button.swal-button--Confirm").withExactText("Confirm"))

});