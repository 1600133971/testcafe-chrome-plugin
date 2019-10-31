
import { Selector, t, ClientFunction } from "testcafe";

fixture `Fixture demo`
  .page `http://localhost:8085/testcafe/example/index.html`;

test ("TestCafe test", async t => {
  await t
    .click(Selector("input#populate"))
    .drag(Selector("button.swal-button.swal-button--Confirm"), 7, 6)
    .click(Selector("input#remote-testing"))
    .click(Selector("input#linux"))
    .expect(Selector("a#href-test").textContent)
    .eql("TestCafe") ;

});