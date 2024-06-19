import Link from "next/link";

const TermsOfService = () => {
  return (
    <div className="mx-auto max-w-3xl mt-10 mb-10 bg-white p-10 rounded terms">
      <p className="text-gray-700">(更新日:2024/6/19)</p>
      <h1 className="text-3xl font-bold mb-4">利用規約</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">
        この利用規約（以下、「本規約」といいます。）は、登録ユーザーの皆さま（以下、「ユーザー」といいます。）と
        このウェブサイト上でサービスを提供する人（以下、「運営者」といいます。）との権利義務関係を築くことを目的として、
        このウェブサイト上で提供するサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。 ユーザーには、本規約に従って本サービスをご利用いただきます。
      </p>
      <h1 className="text-3xl font-bold mb-4">第1条（規約の適用）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">本規約は、ユーザーが利用する本サービスに関わる一切の関係に適用されるものとします。ユーザーは本規約に同意のうえ本サービスを利用するものとします。</p>
      <h1 className="text-3xl font-bold mb-4">第2条（利用登録）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">本サービスにおいては、登録希望者が本規約に同意の上、本サービスの定める方法によって利用登録を申請することにより利用登録が完了するものとします。</p>
      <p className="font-semibold mb-8">利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。</p>
      <h1 className="text-3xl font-bold mb-4">第3条（禁止事項）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
      <ul className="mb-8 font-semibold">
        <li className="ml-4">・法令または公序良俗に違反する行為</li>
        <li className="ml-4">・犯罪行為に関連する行為</li>
        <li className="ml-4">・本サービスの運営を妨害するおそれのある行為</li>
        <li className="ml-4">・他のユーザーに関する個人情報等を収集または蓄積する行為</li>
        <li className="ml-4">・不正アクセスをし、またはこれを試みる行為</li>
        <li className="ml-4">・本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
        <li className="ml-4">・本サービスの他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
        <li className="ml-4">・不適切な表現を含むと運営が判断する内容を本サービス上に投稿し、または送信する行為</li>
        <li className="ml-4">・複数のアカウントを所持する行為</li>
        <li className="ml-4">・営業、広告、勧誘、その他営利を目的とする行為</li>
        <li className="ml-4">・その他、運営者が不適切と判断する行為</li>
      </ul>
      <h1 className="text-3xl font-bold mb-4">第4条（本サービスの提供の停止等）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">
        運営者が、サービスの運営に与える何らかの事由(本サービスにかかるコンピュータシステムの保守点検または更新を行う場合など)があると判断した場合、
        ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
      </p>
      <p className="font-semibold mb-8">また、運営者は本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</p>
      <h1 className="text-3xl font-bold mb-4">第5条（著作権）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">
        ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、
        画像や映像等の情報に関してのみ、本サービスを利用し、投稿ないしアップロードすることができるものとします。
      </p>
      <p className="font-semibold mb-4">
        ユーザーが本サービスを利用して投稿ないしアップロードした文章、画像、映像等の著作権については、当該ユーザーその他既存の権利者に留保されるものとします。
        ただし、運営者は、本サービスを利用して投稿ないしアップロードされた文章、画像、映像等について、
        本サービスの改良、品質の向上、または不備の是正等ならびに本サービスの周知宣伝等に必要な範囲で利用できるものとし、ユーザーは、この利用に関して、著作者人格権を行使しないものとします。
      </p>
      <p className="font-semibold mb-8">
        前項本文の定めるものを除き、本サービスおよび本サービスに関連する一切の情報についての著作権およびその他の知的財産権はすべて運営者または運営者にその利用を許諾した権利者に帰属し、
        ユーザーは無断で複製、譲渡、貸与、翻訳、改変、転載、公衆送信（送信可能化を含みます。）、伝送、配布、出版、営業使用等をしてはならないものとします。
      </p>
      <h1 className="text-3xl font-bold mb-4">第6条（利用制限および登録抹消）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">
        運営者は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、投稿データを削除し、
        ユーザーに対して本サービスの全部もしくは一部の利用を制限しまたはユーザーとしての登録を抹消することができるものとします。
      </p>
      <ul className="mb-8 font-semibold">
        <li className="ml-4">・本規約のいずれかの条項に違反した場合</li>
        <li className="ml-4">・本サービスについて、最終の利用から一定期間利用がない場合</li>
        <li className="ml-4">・その他、運営者が本サービスの利用を適当でないと判断した場合</li>
      </ul>
      <p className="font-semibold mb-8">運営者は、本条に基づき行った行為によりユーザーに生じた損害について、一切の責任を負いません。</p>
      <h1 className="text-3xl font-bold mb-4">第7条（本サービスの退会）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">ユーザーは、本サービスの定める退会手続により、本サービスから退会できるものとします。</p>
      <p className="font-semibold mb-8">本サービスから退会した際、ユーザーの情報はすべて完全に消去されるものとします。</p>
      <h1 className="text-3xl font-bold mb-4">第8条（保証の否認および免責事項）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">
        運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
      </p>
      <p className="font-semibold mb-8">また、運営者は、本サービスに起因してユーザーに生じたあらゆる損害について、本サービスの故意又は重過失による場合を除き、一切の責任を負いません。</p>
      <h1 className="text-3xl font-bold mb-4">第9条（サービス内容の変更等）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">運営者は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。</p>
      <h1 className="text-3xl font-bold mb-4">第10条（利用規約の変更）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">運営者は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。</p>
      <ul className="mb-8 font-semibold">
        <li className="ml-4">・本規約の変更がユーザーの一般の利益に適合するとき。</li>
        <li className="ml-4">・本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。</li>
      </ul>
      <p className="font-semibold mb-8">運営者はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。</p>
      <h1 className="text-3xl font-bold mb-4">第11条（個人情報の取扱い）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">本サービスの利用によって取得する個人情報については、本サービスの「プライバシーポリシー」に従い適切に取り扱うものとします。</p>
      <h1 className="text-3xl font-bold mb-4">第12条（通知または連絡）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">
        ユーザーと運営者との間の通知または連絡は、運営者の定める方法によって行うものとします。
        運営者は、ユーザーから、本サービスが別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
      </p>
      <h1 className="text-3xl font-bold mb-4">第13条（アクセス情報の収集）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">
        本サイトは、Google Analyticsによってアクセス情報を収集しており、ユーザーは本サイトを利用することでcookieの使用に同意したものとみなします。
        また、Google社によるアクセス情報の収集方法および利用方法については、
        <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" target="_blank" href="https://marketingplatform.google.com/about/analytics/terms/jp/">
          Google Analyticsサービス利用規約
        </Link>
        および
        <Link href="https://policies.google.com/privacy?hl=ja&gl=jp" target="_blank" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
          Google社プライバシーポリシー
        </Link>
        を確認してください。
      </p>
      <h1 className="text-3xl font-bold mb-4">第14条（権利義務の譲渡の禁止）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-8">ユーザーは、運営者による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。</p>
      <h1 className="text-3xl font-bold mb-4">第15条（準拠法・裁判管轄）</h1>
      <hr className="mb-4" />
      <p className="font-semibold mb-4">本規約の解釈にあたっては、日本法を準拠法とします。</p>
      <p className="font-semibold mb-8">本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。</p>
    </div>
  );
};

export default TermsOfService;
