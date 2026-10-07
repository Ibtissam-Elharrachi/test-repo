// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

// Logo Evolve intégré à l'email (pas besoin d'hébergement)
const LOGO_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAapklEQVR42s18a5hdV3ne+35r7XOZi0aS5RsYDMU2wTZXmwIhIIuUS4LBQNGUp60gtA0JT6BOSiBOcTOax5eYa+PUBHAItzQNaCAJGCgmdWRRQ+oQU3OxqcEYbGPLlm2NRjNnzmWv9X39sdY+Z5+RbEuy7HD07GcfnT0zZ593vd/7XdcBHsuHGWHmsNP82kvMx1azxhPNNhxzX+dxx3TscSeYHXv6vfdOmYE8+N8UmHmYyaNxy3xMgNlhDlsBkHH0krnffACnrRLPNK9nWsRpBjxBYZtATEPYhAAQBFPrinBJKD+D4KcAbiksfGem5b+7m3zA6gsACAAFaT//AJm5+s2e/BNbv6cRzomUV5rIL6npU21GaA0ACiDmswJm+e4EgAfg8lGxTQHp6SKBbzvGq9vRvrJvunnTEJWd5nEO4iMFio8aY2YTWwhg5seDF/V8sS1Qz9W2nKgFgAHAPgDTSAcDjRTCABrB4Z3J0P4MgOUzDBAUImgBdIBb0SCC63ywTzztR/d+7oazH786XKQac/9pAZozwXYApJoZp2+Jrx94vi04ebG2AfQAlhpBGAQCgiBJqYkQASOS4BAADZB0m8YxdgIGA6AwmIl4TAIigOvqDxsif3LynXv+7OYzj1/JJn5EZsejak5kJICpG8tz+w25MLTleWoAVqNRGEFzEBLkGCDDA0ifQVhnTgJt7d1WPKpeNDMAagDQEidtQDr6w8lYvnv/8a3P2RpmP3YAJWEkSN30971Tlwt/WZhwr4sE2NOYhdYNQZH8pgSGfqcCIn9eyphp1ZhjqHyZZXJBAYR8xHQwmFqEoiXeNwHfDX85E7rn3/Ocdfdhp3lsYXhsAMorQgATXx+8vd+Wi+OEW2fLqqQBjgI/zhZKXvz87szs4JAl6SrXsgi168YERgAYR8AgGiwCUCbgSlMLMM6I8339yUSp/25pS3Ht4YB05ADlNznxL+7atPek468sJ91rtQvQYoSnoyOMBjoeoCsGA6uopibGlmEgEzjjv5PYwuztzPJzy0cELAJUg2kGUC29HhDQEO9Nteja+d1X+ivS4kKHK3JUAcrgzHyl/+zVpvtMmHCn2YoGOnNwQjhLDGB2zXVTqT50ZS5ccycVW6R23UYmVLc2ZIBMDTTCMoAWDwwbEE3NQDchbHT0ku6r3IWY2+kxf058KJB4pOBM/1Xv3G7b/2Us3BT6GuDh4bJ2uKTDEAPcGkGWcTBY905Dc0rgGGsao/nnbcQa02xumpgDpOeWAEmmVpmfAYhmBokyAd9cCu/vzhbvxJx5zONBQeIRgfOZ/pu7E/7PIoVQjXB0CZgKoBoQMjKZMYB4kDwDa7xWXv3hrVt275p+wGJizhibbA178tmG5mlmJsFNomh1wiWdNxQXPpQm8bDB+XT317ozrU+EgSoBwFPgsvhKPrs17lvsQNFd45mMaiBTIJiYMfLh6VUSpFmdEZUOJSaNXdM1AEUDK2DVAEPwE+Kby+XbO7/WuCIx6UCQeDjeaupjvdf0poq/DlEiqYRL4CSdyeaUwbC6Sa0BhlmoQVMIFTkqtiKHAfn3hh84ACgBRo1QGKI5GJlA4JhQV0yiVaZWM1Grg5fMrSjUT5T6L5beXFxzsDiJhxDnCEhd/+GVZ3am2t8sDW0qDJ5SmVPFHkjyWkbLoBwo1KClNSSFk0K0AAkA+7oC4E7C7oHFZYI9c85TbaMqTgJxkjZdSw1AB0BfIyIkcY4jU8x5HGMGaK1Yj4Gkat6xEeLuTU33jLtvwyIAYJ56aACZEdvBk5+Edbtj+Y+DongKy6w5rAEy1BwDPXMAWBfoCjCLJs7JNMAAQPU7vtCvOcE1x3j/vTueg92S04FajIw/2Gn+I+id1BGeNbDi5THaedZ0x+kygEFUQmT44TMYBwBkBwEo6VhgW3xrtVzovr0xu5ZFPBTTan2o/1f96cZrraMBjh6yJtp1I5bQZTbVzItUU4FxyokMYvCeO9ouXrn4ouLrXJsfzZngDBBbASwAuAlWX1EAOOEr+4/dL623DKK7IFKmsBoVJjIEqM6YB2GQ6cgjmlnwbfHtQThv+e3FF9cm2w+tOx/s/ofuTOtPY0cDHPzQhY95qtr/ZcSmlFNZREOcNAFR/fyEhYuXXt68cUz874OlZLIWSo9TmZgDsR3EtWDlcTYs9M/oFO7TJdxzsKoKowwBORhQaz1dpVVmCi9sxnDrE073T7/1epSYrwoLD5aVAzjuJBy7uBp+UIqfYYyEEx7oxmsaMwQog0MLmBbvVO9pmp2/eq7fMUwaARxu4jhm+lfC4zdYznxicf1qc/r6IO5U9NWglBRUpnDAYi1nq+pM+WCshxMa3ZRz7bL3WyvvbP9J5dX4UOxpv6f3qd5k843Wy6ZFgK7yVnmxyXGAXBU1W+A68YXGnZM6eNPiayfuzGUHA8dN5hHkgg3McjDxsf62/kTj07GjgZH+ABevBwdpKOoKIKrCO7YYbj/+JP+029+MflWOGn9sTeCse0/n7JJ+my1rRIQf0ZVpdSKAyFo2bUNaW7QgE+JbnbDjBd92L1t87cSd2Gkes4xHDRwAuAkBZmR3cKPsU6BHj4HByhQWIAAWkkOwsWw/O4mydgQRdFTL0j/p/lu65wE0zMEdUDzH6SmE6XX9paHtiFJBz1o2XZOuWvRrHNZlgqwT31yJC71txb/aZUZsNwEPvcRwyI8zQGwH5LjmNIxAaQrNi66j5HZckEevDUVbR7ERAsyseB2Az+JmrOkE7DCHeer6ucEvmm+8FB1VKJ3pGpe5pv5SSwgjC/H+/s71j9972zZLFUYeVdbUhXs3POapYZX/MoBACbUSYMWeMh0MtXseADbIgecYg9JZS6gOuB61iu/osZBOqwG/GxKyOhah1ovq9ddSaUEhQnfP4t7JG//v7K3nn9bHzQtc66KPWs3bAJzP/rrLui8dkG/DfihLOASOTCwfVo5AQbB0HqTXMQDQN6BnAYHOAa7Q8rPZmujHPNc848Z33f+0ZfBcW1UDMbw+9jGztzLNwWGir7mlVde87+7/uHjli+54sNzmET22msPpMMwybt2xw33pfeE3VtW9L/atgTIm1zkmvGtiH0vEGwaREYBZhEHYFO80rrYG8dLly9sfz3gEv+Zja5fT22LDF+jEAE8/fMN4kMjSshcTRu4fOLf37l2rl5/5F6nOchTByWEH5lP1cvKS8jVfuIUXBu/O0j7AVMYgtMr0a1XHeJDoOacZMGdo0DkADep/99K5ePnymVsAGzLfD+15HvGst1jx3VC+XrsADAJlyrPqf9xZakaYpYqfA2zvXvpB0Nb6De8aAMDN59hRA+ZmsAJm3bxt6cZ44aq6l6gCWI4RRjFw2C+q14hGIl1/LX+awjlxgLf4dw3R7St/1PjfQ5YujOKzBNBWCBYYfzg5OEvFn4q+GkWkAn7owiRlSGajzoMtL0Wi6cQPrt4/f/w/YOuOsTc44kBwO1zFwo3zned1rLhgRfGa6BywqkozmIkjLDEC1UIygVKVZIcZvxkMESJemnBe9TuFt0tXP+B3DOrmOz9+774SI6Tg86VGAtGiEUPzGnUdOCojAMDqCjDoQ9ptNIvmhwYw4vRr+Yg80xxcDgnCMXP7f2FZWxcsmdsWnQi6MX9sOsuFsupMq0XJqP0/sSaC4tiG91HvbYhccvLMDz568/yZA8CIrQvyYItaaZASQCixJYfeRMyg6Jp4p6ol91aBUCqKKSeDpTtnNvT/1zI2GuYtHrFnmmXEPMKx77UT9nf1d5ci3hoKmUDPAGgExIFwqKULa/WFqIm0ZgFuiXMhrhTgh4/bKB+8fZ733Fw3pwXEB69JmxGkPfGt+zbcg4kfD6zYAKjBk8OeeJW9V72sQQ+IA4AWODnjm7b3I72LN701ifOWcNg6kwXxrLm7Jm7isb8V1L0jFnK89QBojKC4evnB6ll7PbcaFs5MzWAoxDk1FM4+OVWUl97/vtaP8ns+ZB16nEGzEABx0YqnRhYbEKLBccSgakWY+dYfACEABQEaRRTe2dVHLMLz1K1bd7gvP/N1274TcEF07qkpPtEAwg3B4bjjHN5bzbQyLAovTgh4i3872dbti+9tfLNXAbMd8XCiel/pD8rwNDQBGCM0JRdWrVCVpa+WQAxg4WEWDd45KZd767zcsAIAuFYPF5xNF/ZO/WKz+PMB5XmmAHoxps69+IMV81kvW1SXzAyaBJgNOCn1e63CLuq8zy8sjgtwwPzhraHH7hsIAIM48aQ6bYd5V3UXZQT6ASwkNeYcDb5Fo/74rgvX/4z/BcD8vB5OXLPxd+54/JLgmlLkCVjRAEBAcSNb4ahNTYwNMNAAggZTNYpjC94N4l1N0ff86kzx0YV5Durx05G6DY9bzjIAiEFOjC6vzphrBxAV6JWgk+Q1NHX26BwK4HaSltz77KHdyBkgZhn78+VF2vRPwFIcgGwcUCqvNRsr9ozMSSNUHJviGiEuO7rL17vVy3e/Z939CxVr5h9huAHA47jMEY0boZIBsvGGeHcA0GBOUjBmrNoygHF3ChW28pBjHDKecMn+Y/cO9PWxowaiGK8QpGDU1ghzaiSa0gC0nXP9WErQT7aLeNnSZf62bl2AFx45OMNkNelvmMy2TeooEsVqHyxj+lHlaMptGH/45cN6x+QU0Om0nhJYTOeOKLPNZFg4WqJhPGMKtYiGCNsiDerfbJh2zx18oPGWpcvat2HOfE4RwqF4p0NnULVK4qQKrgx5uQYR7JaA96AKLEqqJlo+AgC1IwoMOVVEUSCEcebYsK06nAFKAlyId01Agv6Dh17cu6i46r61AvwoPPxwDiBqaYLRcKAa0OlXgpzGTFgrRFXVRPXtwwsIU3F+Cvtv68bmCnyzjVIJo4x5LDNLxXTnpA0vfb29YfHSd2rxsfl5p0dDgA+LQdFkNQ8TmEHAXh8YlIAvYFUclPMaxmwCEQDisQCAm3FotCYNO8zdPcsH2heVH7BJzIVFlDBT0BJISoXQy4Q4CbrXqV5xfKvzR3f8/vrF+aMowIcG0J6q2SIPsFq+GMHO6igw0yQTVom4WnJjAyCIfwIB2AL0MHRIMWdy7lNx0Zd+0HuyTbfeaLWSCjxE+loWMX58Q7O8dPcFE3fcUU9HFo4iOGbEQi4cHmSO0eMcALsAJ+VuhUeEQFaXgUEJ80Uq0FdyblUrhSCM1gPM49QTL1g65u7L+EAeeToEJtEwb1gADGi/af0flp/rU/7NINqpQvadybebrfCxpXc1b9xd90yzR5U1xA6TPAEb17baRwBdm540PG4NCmAQIJ1OGlxXg1FzKS2blkv6ZEIiRNXCz+zrNJ4L2NWpbIJD/BBVmGDcR14F4KrKiksAvcqUdkCPesG/YuIs4zOutsmfTeMMs9Ifc9tPv38rub/KTxMvchxUBrtVS8B1VhzLAZhTYloeToqp7pJ66qzmAFUBaJRzAdowbTmsdUyahB2pFGcwYs485iyVIHj0XHaqZRsxy2hzJhNfDb9+s8Sb9pe4fjkW37jj5Cd/f93flS8HadXWhmE2f/L5tn733f0f257FjYw9M9+gigdcAXNFPjuYCNggrJHHVxpOChd2b5z2p977AayOsePn5VHpTB44nfyfvdcN6H8/TLiztQRQRgOhXOdcoxfvO2H98mm3P2v9UmIQacCc3H4592Fx3/fFBDQoTSGmoCmoucCimtlUTX6JoIwx0p+43I2vq5ptP1fg7DAH0jDLOPOF8iXFl8O13aL5+dK5s21/jOyrEiRBZ8uqJu7YzmLjKSANC5Ck3pu3CwC4/UvfTFFyNJplMCKgAdQAWm4HRAMiq84AtYSFEr+3ec58cvfGnwPaJFOdZTx2x8oJjb8p/3zF+2tK7zbrSlR2o8Loqto7zAxeiBCW3caJOyuvlgDKOiTFxNWMA9BUEAOgEbSYGKQxJa2hOlsef6OgHzWYO+OG3fHXscD4T86iOZPkKRmmP9N71WLR+lbZ9P9Wu6roaAQoBhHWusRmjNIGncOOe5/FPRXzakUE2smbf9K6tz/4EV3zJLOgykIgDuY84D1UGlAWgHOwwgGN4aiLwTnzPu7bOONO3/PH2IM5PDpNw4cHx2Oe4ZTLf9i8a9OTLxm0/TuiAgx5fGc4ukPAVfORZnBihYthHcMzHvjl1i2Vu5ehqG7e6W/f9eSeo3wZMgGaKqFDb5Z6ThF5MDCbX5VuCBHVIt3GpaX4CYKGa6uM9jEU4tQ6DzNXrjzrjg3/7Lpe078jrqiypwqDHzURuXamMXICImX4zAO/3Lols0fHW8/H3ZfMTOyT0G5+mkXakomxMjkzQA0srUpYQaWzroYS7ldab4x/iF0MeAv8YwJSTYinPjL4zRXX/kZJdzb2aaBCoJARGFxT7DcDIL6n/ek2LoYZsXWUNo0AWpiNwJzsv+7U6xl63zK2CLOYdi7Z0IshhFR21ZBSkmFcBEDhtath4OSCyTeH38GVLLEZ7lEFKQvxKZffv655xeBTq43iw7EvE7aiEaA/AJBq1no0qhJlUqQx0D++/5zWj7CAsUh6fHhh8zlC0jzkA04aJEYMYk6WqBGMGRxNpsdQ65UBLnY19qL74MSbBu/mrlyf2bzTH/0BhlT/mb5s9Rdvx/rrB0XxRl3SyFKNBldtcBmNCnPNSJ6pNUTcarzrxGP8xZgzwdbxnHIcoF1bAjAnz37FKZ9nXLrJ2BSoxiomSiYXwZgOizGFAVGTuZUAIonSJHY19rS4uLGt/NRT32nT2LUlYKs5bB2OmR+Z665Fw3MAJ98f/tOqa+ws1f0C9muApv2Lw80sYzNANtzgAjWYQn0BaVt8163P536cAa6N3HnQCYoFxvUvvu3VpU58QQdLkc45EwelS16MDiYOKg5w2atRABGYk9FguSFyQpzT+IMGw7u6/6P1peG7b7ZU7t1xCMObgOBmWJXFE0B7rndu6Yp3x7Y8X/sGiikcxSTNC8Bbnr7N3koA83mI3RGkRqx3rtEpv9jf2jjvwTbbHXwlcwF+8vm3fDVi8uWIy5G+cFYBJAkgoxs+ByW9Jg7mJbvRVOyGd855wFO/5Jz+t09+yl8zu3YfaTWoMJpVOmCr0hMv2LdhT5x6RSl8q7XkRakdrJEeAkcmQDIwvgInzxQ4AD6BZQJFU1BIXFzn+s944LyJ3dh+8LDkwadc52GbXvzjUzp9udFMm0QUiKPCp7hIEmuMAhMP1gBKDBOYsIo30hsXIs4BTvT75nBVo63XtGb8D17y3IV7Pzd7YEfkOR+1iZ/8FE9a7cTnKu1lEXyJNtwJqRKrmkGQYefXWxpqd8zDpok1yKyygoAzg0f0U+LbvfDq5TcUVz3UVk0+5LDSAuP0C//fbwds+K822FuSUiRQPOB8Miu60VlkxCoKLN+ZuQwULEJANEXQzJPCGjtG3OU8dotwSQE1F1t0blNUnEja47TlUkgbAVje5lnQwSPvJsIIGF89zxO5fsQcpGul2yhFYzVc2v3XxbsfbvchH7KgtHmn464tYeJ5P/qiuulXYbAYIM4jg2Q1FlWgANXzBBhYmR8ToxxBmpqDwkHgRUYmgfH9ZNU2XdGYryVTqk/314fXfWZKNidm9pjPWyS8lVwvRWNQfnawrfEGO4QePR/Wa2A7Tz7vt9fdv2fxW1HlFOpqhHg3BGkNg8B0WBZyiMvhfMWmtNImVq2soQq2hruChjuG0j9BGmDPM0nDLVdrt0P4pEHJ3FgxBnQG8yhlgxSNGK8940z3shuuQsR22MPVm+Rhq35z23H7Fzbsa8Z95wntAUjLQTUHkLWSiClkLNqO6ZrWSiYah6yg5k6J1tGjo6azGfO4et56WOvV2UG2F4xceaoyWAQsGBAMFqxkWwrfjdedvN69+oazEYbFuoetyx7q8OQC44Zf+t4L+2H6qwabgvYjpUhMQtq+hcrV0w3PiopRScTpHMwJjIRlIaVj3oyXxvoSLBzft1pt8ay848F2ONZ2HWWPZnCMXCe+ML16xsnr73sbV+ojN4fUWX3YxwIjNu/0i9c9/RtNt/IrDraPbtKZaTCzpL2WrISwnOBaLrDlaNtsVHizdJ0RYF5xWN6tPNxiaWOTHPWZw7Qj0Q5kkdZ2AJSmiDRpim/1w8dfsFfOPVxwxvpiD/vYtSVg806/uOvM64594bfPWY0bPm9u+ikIy4HiXOJ2tT8mgaSJxtn95FERzZNOtCTamhlTdXR1zfCPjI/VJdHOgwzVz2TdhmXWmQW0nPdetVmW7+j858YHd5kRmJPDLcEcfsifze34F3zjuA5P+rhx8pUWl5Bqi95VQSOym0+uX4bRdyXqFMJEoF5ycDfaK5++gCAByGxmVhNwOA73q1kVBKbfi6AJpx2d6g9bRXzLylxj16HukT9yE1trblt3uHv//oV7Vr558rkO+/5ApDGATDnTGKFRUQlzlexmExsrn5im19TytydYNVeYTYXDOSVbu6aWh1ZHJhZhiCjEuULYjPqRJ07JP1+Za+yqsv0jbSQ8sonUTPxNz7v1rJ603q9sn2MoYbEXIR4QEVBoqNx9ZtQw4iYggigpfxtt7eQwPWCu/o0xKAm55U3BREtEGoC3uGuyqRcuXtK4rs72R9ZdfKSPzTs9dm0JBDD1gp9uM/rfU5k4I23d7cEoAaSYOIJCiqQkdyxVEZgjzGdgBKMvOcnxjeWBBjDv5/HOoZGcmhf9emPSruhc5hdsCMyRmdTRByixKUsp7ZRXfKV5//4zXx/Y+PcK26xunZhFmJUgEE3ETIQmQoiwcv9wAnUkff7eKqToAenLlwBQ4ERQANIAJOp+h/i1ZhGvXP5Q+2+raa408zx71FrUR7fSt4bSG158z9Nj1PPUtV4Voz5b/XQB36gV+RQmaVjNRBKDfC2m8QAaAH0Wy6j3i7f/02rhr9e13dfufi9/NgIGclSHGh4VgMZudkRxAti05d6ndMvOc6w5c6axcboan2SIx5u4KaNroRCHQsSE0cS6IPbBYbdryG3SlO9ONsM/to/xN941z722tkSy8OiNwjy6BfU5E1wLwa4DE0ICeNrW70/tCcdND2x6wjfLhim9NIpB262snPTMY/Ze/w527WAsPT2Pcj0GbaX/D5aAzGUzHk19AAAAAElFTkSuQmCC";

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!)
  );

Deno.serve(async (req) => {
  // Sécurité : seul le webhook Supabase connaît ce secret
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await req.json();
    if (payload.type !== "INSERT") {
      return new Response("Ignored");
    }

    const feedback = payload.record;
    const recipientId = feedback.recipient_id;
    const senderId = feedback.sender_id;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: recipient } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", recipientId)
      .maybeSingle();

    const { data: sender } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", senderId)
      .maybeSingle();

    if (!recipient?.email) {
      return new Response("Recipient not found", { status: 404 });
    }

    const senderName = escapeHtml(sender?.full_name || "Un collègue");
    const recipientName = escapeHtml(recipient.full_name || "");
    const content = escapeHtml(String(feedback.content || ""));
    const isPositive = feedback.type === "POSITIVE";

    // Le bouton "Ouvrir Evolve" n'apparaît que si l'app est en ligne (pas localhost)
    const appUrl = Deno.env.get("APP_URL") || "";
    const showButton = appUrl !== "" && !appUrl.includes("localhost");

    const accent = isPositive ? "#16a34a" : "#f59e0b";
    const label = isPositive ? "un feedback positif" : "un axe d'amélioration";

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: Deno.env.get("GMAIL_USER"),
        pass: Deno.env.get("GMAIL_APP_PASSWORD"),
      },
    });

    await transporter.sendMail({
      from: `"Stellantis Evolve" <${Deno.env.get("GMAIL_USER")}>`,
      to: recipient.email,
      subject: isPositive
        ? "Vous avez reçu un feedback positif"
        : "Vous avez reçu un axe d'amélioration",
      attachments: [
        {
          filename: "evolve.png",
          content: LOGO_BASE64,
          encoding: "base64",
          cid: "evolve-logo",
        },
      ],
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;color:#0c2340">
          <div style="background:#0a3a75;padding:18px 24px;border-radius:12px 12px 0 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#ffffff;border-radius:10px;padding:6px;line-height:0">
                  <img src="cid:evolve-logo" width="34" height="34" alt="Evolve" style="display:block;border:0" />
                </td>
                <td style="padding-left:12px;color:#ffffff;font-size:18px;font-weight:700">
                  Stellantis Evolve
                </td>
              </tr>
            </table>
          </div>
          <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 12px 12px">
            <p style="margin-top:0">Bonjour ${recipientName},</p>
            <p><strong>${senderName}</strong> vous a envoyé ${label} :</p>
            <blockquote style="margin:16px 0;padding:12px 16px;background:#f8fafc;border-left:4px solid ${accent};border-radius:6px">
              ${content}
            </blockquote>
            ${
              showButton
                ? `<p style="margin-top:24px">
                     <a href="${appUrl}" style="background:#0066cc;color:#ffffff;padding:10px 22px;border-radius:20px;text-decoration:none;font-weight:600;display:inline-block">
                       Ouvrir Evolve
                     </a>
                   </p>`
                : ""
            }
            <p style="margin-top:28px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;padding-top:12px">
              Message automatique envoyé par Stellantis Evolve. Merci de ne pas y répondre.
            </p>
          </div>
        </div>`,
    });

    return new Response("Email sent");
  } catch (error) {
    console.error("notify-feedback error:", error);
    return new Response("Error", { status: 500 });
  }
});