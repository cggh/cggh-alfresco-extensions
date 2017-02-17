<#if form.fields["prop_cggh_collaborationStatus"]??>
    <#if form.mode == "view">
        <@formLib.renderField field=form.fields["prop_cggh_collaborationStatus"] />
        <@formLib.renderField field=form.fields["prop_cggh_enquiryStatus"] />
        <@formLib.renderField field=form.fields["prop_cggh_nextReview"] />
        <@formLib.renderField field=form.fields["prop_cggh_ragStatus"] />
        <@formLib.renderField field=form.fields["assoc_cggh_liaison"] />
        <@formLib.renderField field=form.fields["prop_cggh_sampleCountry"] />
        <@formLib.renderField field=form.fields["prop_cggh_species"] />
        <@formLib.renderField field=form.fields["prop_cggh_samplesExpected"] />
        <@formLib.renderField field=form.fields["prop_cggh_samplesProcessed"] />
        <@formLib.renderField field=form.fields["prop_cggh_samplesSequenced"] />
        <@formLib.renderField field=form.fields["prop_cggh_webTitleApproved"] />
        <@formLib.renderField field=form.fields["prop_cggh_descriptionApproved"] />
        <@formLib.renderField field=form.fields["prop_cggh_firstSample"] />
        <@formLib.renderField field=form.fields["prop_cggh_lastSample"] />
        <@formLib.renderField field=form.fields["prop_cggh_strategicNature"] />
        <@formLib.renderField field=form.fields["prop_cggh_legacyID"] />
        <@formLib.renderField field=form.fields["assoc_cggh_projectsdl"] />
        <@formLib.renderField field=form.fields["prop_cggh_internalDescription"] />
        <@formLib.renderField field=form.fields["prop_cggh_collaborationNotes"] />
        <@formLib.renderField field=form.fields["assoc_cggh_collaborationDoc"] />
    <#else>
        <div class="yui-gd">
            <div class="yui-u first">
                <@formLib.renderField field=form.fields["prop_cggh_collaborationStatus"] />
            </div>
            <div class="yui-g">
                <div class="yui-u first">
                    <@formLib.renderField field=form.fields["prop_cggh_enquiryStatus"] />
                </div>
                <div class="yui-u">
                    <@formLib.renderField field=form.fields["prop_cggh_nextReview"] />
                </div>
            </div>
        </div>
        <div class="yui-gd">
            <div class="yui-u first">
                <@formLib.renderField field=form.fields["prop_cggh_webTitleApproved"] />
            </div>
            <div class="yui-g">
                <div class="yui-u first">
                    <@formLib.renderField field=form.fields["prop_cggh_descriptionApproved"] />
                </div>
                <div class="yui-u">
                    <@formLib.renderField field=form.fields["prop_cggh_ragStatus"] />
                </div>
            </div>
        </div>
        <div class="yui-gd">
            <div class="yui-u first">
                    <@formLib.renderField field=form.fields["assoc_cggh_projectsdl"] />
            </div>
            <div class="yui-g">
                <div class="yui-u first">
                    <@formLib.renderField field=form.fields["assoc_cggh_publications"] />
                </div>
                <div class="yui-u">
                    <@formLib.renderField field=form.fields["assoc_cggh_webStudy"] />
                </div>
            </div>
        </div>        
        <div class="yui-gd">
            <div class="yui-u first">
                <@formLib.renderField field=form.fields["assoc_cggh_liaison"] />
            </div>
            <div class="yui-g">
                <div class="yui-u first">
                    <@formLib.renderField field=form.fields["assoc_cggh_collaborationDoc"] />
                </div>
                <div class="yui-u">
                    <@formLib.renderField field=form.fields["prop_cggh_legacyID"] />
                </div>
            </div>
        </div>                
        <div class="yui-gc">
            <div class="yui-u first">
                <@formLib.renderField field=form.fields["prop_cggh_sampleCountry"] />
            </div>
            <div class="yui-u">
                <@formLib.renderField field=form.fields["prop_cggh_species"] />
            </div>
        </div>
        <div class="yui-gd">
            <div class="yui-u first">
                <@formLib.renderField field=form.fields["prop_cggh_firstSample"] />
                <@formLib.renderField field=form.fields["prop_cggh_lastSample"] />
            </div>
            <div class="yui-g">
                <div class="yui-u first">
                    <@formLib.renderField field=form.fields["prop_cggh_samplesExpected"] />
                </div>
                <div class="yui-u">
                    <@formLib.renderField field=form.fields["prop_cggh_samplesProcessed"] />
                    <@formLib.renderField field=form.fields["prop_cggh_samplesSequenced"] />
                </div>
            </div>
        </div>
        <div class="yui-gd">
           <div class="yui-u">
                    <@formLib.renderField field=form.fields["prop_cggh_strategicNature"] />
           </div>
        </div>
        <div class="yui-gd">
            <div class="yui-u first">
                <@formLib.renderField field=form.fields["prop_cggh_internalDescription"] />
            </div>
            <div class="yui-u">
                <@formLib.renderField field=form.fields["prop_cggh_collaborationNotes"] />
            </div>
        </div>
   
        <div style="clear: both;"></div>
    </#if>
</#if>